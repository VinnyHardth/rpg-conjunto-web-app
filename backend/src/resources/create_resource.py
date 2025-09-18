import os
import re
from typing import Dict, List, Tuple, Optional

PRISMA_FILE = "../../prisma/schema.prisma"

def parse_prisma_models(prisma_path: str) -> Dict[str, List[Tuple[str, str, bool]]]:
    """
    Parseia o arquivo schema.prisma e extrai modelos com seus campos,
    incluindo informação sobre se o campo é opcional.
    
    Retorna: { model_name: [(field_name, field_type, is_optional)] }
    """
    with open(prisma_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove blocos de comentários multi-linha
    content = re.sub(r"/\*[\s\S]*?\*/", "", content)
    
    model_regex = re.compile(r"model (\w+) \{([\s\S]*?)\}", re.MULTILINE)
    models = {}
    
    for match in model_regex.finditer(content):
        model_name = match.group(1)
        body = match.group(2)
        fields = []
        
        for line in body.strip().split("\n"):
            line = line.strip()
            
            # Ignora linhas vazias, comentários e atributos
            if (not line or 
                line.startswith("//") or 
                line.startswith("@") or 
                line.startswith("}")):
                continue
            
            # Remove comentários no final da linha
            line = re.sub(r"//.*", "", line).strip()
            if not line:
                continue
            
            # Parseia o campo: identifica nome, tipo e se é opcional
            field_match = re.match(r"(\w+)\s+(\S+)(\?)?(?:\s+.*)?", line)
            if field_match:
                field_name = field_match.group(1)
                field_type = field_match.group(2)
                is_optional = field_match.group(3) == "?"
                
                # Remove modificadores de array para análise de tipo
                base_type = field_type.replace("[]", "").replace("?", "")
                
                fields.append((field_name, base_type, is_optional))
        
        models[model_name] = fields
    
    return models

def ts_type(prisma_type: str, is_optional: bool = False) -> Tuple[str, str]:
    """
    Mapeia tipos do Prisma para tipos TypeScript e schemas Joi.
    
    Retorna: (typescript_type, joi_schema)
    """
    type_mapping = {
        "String": ("string", "Joi.string()"),
        "Int": ("number", "Joi.number().integer()"),
        "BigInt": ("bigint", "Joi.number().integer()"),
        "Float": ("number", "Joi.number()"),
        "Decimal": ("number", "Joi.number()"),
        "Boolean": ("boolean", "Joi.boolean()"),
        "DateTime": ("Date", "Joi.date()"),
        "Json": ("any", "Joi.any()"),
        "Bytes": ("Buffer", "Joi.binary()"),
    }
    
    # Verifica se é um array
    is_array = "[]" in prisma_type
    base_type = prisma_type.replace("[]", "").replace("?", "")
    
    # Obtém o tipo base
    ts_type, joi_type = type_mapping.get(base_type, ("any", "Joi.any()"))
    
    # Aplica modificadores
    if is_array:
        ts_type = f"{ts_type}[]"
        joi_type = f"Joi.array().items({joi_type})"
    
    # Para campos opcionais, adiciona .optional() ao Joi
    if is_optional and not is_array:  # Arrays já são opcionais por padrão no Joi
        joi_type = f"{joi_type}.optional()"
    elif not is_optional and not is_array:
        joi_type = f"{joi_type}.required()"
    
    return ts_type, joi_type

def gerar_arquivo_types(model_name: str, fields: List[Tuple[str, str, bool]], folder: str):
    """Gera o arquivo de tipos TypeScript."""
    with open(f"{folder}/{folder}.types.ts", "w", encoding="utf-8") as f:
        f.write(f"import {{ {model_name} }} from '@prisma/client';\n\n")
        
        # Filtra campos que não são id e não são relacionamentos (começam com minúscula)
        create_fields = [
            f'"{name}"' for name, typ, optional in fields 
            if name != "id" and not typ[0].isupper()
        ]
        
        f.write(f"export type Create{model_name}DTO = Pick<{model_name}, ")
        f.write(" | ".join(create_fields))
        f.write(">;\n")
        
        f.write(f"export type Update{model_name}DTO = Partial<Create{model_name}DTO>;\n")
        f.write(f"export type {model_name}DTO = {model_name};\n")
        f.write(f"export type Delete{model_name}DTO = Pick<{model_name}, 'id'>;\n")

def gerar_arquivo_schemas(model_name: str, fields: List[Tuple[str, str, bool]], folder: str):
    """Gera o arquivo de schemas Joi."""
    with open(f"{folder}/{folder}.schemas.ts", "w", encoding="utf-8") as f:
        f.write("import Joi from 'joi';\n")
        f.write(f"import {{ Create{model_name}DTO, Update{model_name}DTO }} from './{folder}.types';\n\n")
        
        # Schema de criação
        f.write(f"export const create{model_name}Schema = Joi.object<Create{model_name}DTO>({{\n")
        for name, typ, optional in fields:
            if name == "id" or typ[0].isupper():  # Ignora id e relacionamentos
                continue
            _, joi_type = ts_type(typ, optional)
            f.write(f"  {name}: {joi_type},\n")
        f.write("});\n\n")
        
        # Schema de atualização
        f.write(f"export const update{model_name}Schema = Joi.object<Update{model_name}DTO>({{\n")
        for name, typ, optional in fields:
            if name == "id" or typ[0].isupper():  # Ignora id e relacionamentos
                continue
            _, joi_type = ts_type(typ, True)  # Todos os campos são opcionais no update
            f.write(f"  {name}: {joi_type},\n")
        f.write("}).min(1);\n")

def gerar_arquivo_services(model_name: str, fields: List[Tuple[str, str, bool]], folder: str):
    """Gera o arquivo de serviços."""
    with open(f"{folder}/{folder}.services.ts", "w", encoding="utf-8") as f:
        f.write(f"import {{ PrismaClient }} from '@prisma/client';\n")
        f.write(f"import {{ Create{model_name}DTO, Update{model_name}DTO, {model_name}DTO }} from './{folder}.types';\n\n")
        
        f.write("const prisma = new PrismaClient();\n\n")
        
        # Create
        f.write(f"export const create{model_name} = async (data: Create{model_name}DTO): Promise<{model_name}DTO> => {{\n")
        f.write(f"  return prisma.{folder}.create({{ data }});\n}};\n\n")
        
        # Get by ID
        f.write(f"export const get{model_name}ById = async (id: string): Promise<{model_name}DTO | null> => {{\n")
        f.write(f"  return prisma.{folder}.findUnique({{ where: {{ id }} }});\n}};\n\n")
        
        # Get all
        f.write(f"export const get{model_name}s = async (): Promise<{model_name}DTO[]> => {{\n")
        f.write(f"  return prisma.{folder}.findMany();\n}};\n\n")
        
        # Update
        f.write(f"export const update{model_name} = async (id: string, data: Update{model_name}DTO): Promise<{model_name}DTO> => {{\n")
        f.write(f"  return prisma.{folder}.update({{ where: {{ id }}, data }});\n}};\n\n")
        
        # Delete (soft delete se tiver deletedAt, caso contrário hard delete)
        has_deleted_at = any(name == "deletedAt" for name, _, _ in fields)
        
        if has_deleted_at:
            f.write(f"export const delete{model_name} = async (id: string): Promise<{model_name}DTO> => {{\n")
            f.write(f"  return prisma.{folder}.update({{ where: {{ id }}, data: {{ deletedAt: new Date() }} }});\n}};\n")
        else:
            f.write(f"export const delete{model_name} = async (id: string): Promise<{model_name}DTO> => {{\n")
            f.write(f"  return prisma.{folder}.delete({{ where: {{ id }} }});\n}};\n")

def gerar_arquivo_controllers(model_name: str, fields: List[Tuple[str, str, bool]], folder: str):
    """Gera o arquivo de controllers."""
    with open(f"{folder}/{folder}.controllers.ts", "w", encoding="utf-8") as f:
        f.write("import { Request, Response } from 'express';\n")
        f.write("import { ReasonPhrases, StatusCodes } from 'http-status-codes';\n")
        f.write(f"import {{ create{model_name}, get{model_name}ById, get{model_name}s, update{model_name}, delete{model_name} }} from './{folder}.services';\n\n")
        
        f.write("const handleError = (res: Response, err: any, context: string): void => {\n")
        f.write("  console.error(`${context}:`, err);\n")
        f.write("  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({\n")
        f.write("    error: ReasonPhrases.INTERNAL_SERVER_ERROR,\n")
        f.write("  });\n")
        f.write("};\n\n")
        
        # Create controller
        f.write(f"const create = async (req: Request, res: Response): Promise<void> => {{\n")
        f.write("  /*\n")
        f.write("    #swagger.summary = 'Create a new %s'\n" % model_name.lower())
        f.write("    #swagger.description = 'Endpoint to create a new %s.'\n" % model_name.lower())
        f.write("    #swagger.requestBody = {\n")
        f.write("      required: true,\n")
        f.write("      content: {\n")
        f.write("        'application/json': {\n")
        f.write("          schema: { $ref: '#/definitions/Create%sDTO' }\n" % model_name)
        f.write("        }\n")
        f.write("      }\n")
        f.write("    }\n")
        f.write("    #swagger.responses[201] = {\n")
        f.write("      description: '%s created successfully.',\n" % model_name)
        f.write("      schema: { $ref: '#/definitions/%sDTO' }\n" % model_name)
        f.write("    }\n")
        f.write("    #swagger.responses[400] = { description: 'Bad Request' }\n")
        f.write("    #swagger.responses[422] = { description: 'Unprocessable Entity' }\n")
        f.write("    #swagger.responses[500] = { description: 'Internal Server Error' }\n")
        f.write("  */\n\n")
        f.write(f"  const {model_name.lower()}Data = req.body;\n\n")
        f.write("  try {\n")
        f.write(f"    const new{model_name} = await create{model_name}({model_name.lower()}Data);\n")
        f.write("    res.status(StatusCodes.CREATED).json(new%s);\n" % model_name)
        f.write("  } catch (err) {\n")
        f.write("    handleError(res, err, 'Error creating %s');\n" % model_name.lower())
        f.write("  }\n")
        f.write("};\n\n")
        
        # Get by ID controller
        f.write(f"const getById = async (req: Request, res: Response): Promise<void> => {{\n")
        f.write("  /*\n")
        f.write("    #swagger.summary = 'Get %s by ID'\n" % model_name.lower())
        f.write("    #swagger.description = 'Endpoint to retrieve a %s by ID.'\n" % model_name.lower())
        f.write("    #swagger.parameters['id'] = {\n")
        f.write("      in: 'path',\n")
        f.write("      description: 'ID of the %s to retrieve',\n" % model_name.lower())
        f.write("      required: true,\n")
        f.write("      type: 'string'\n")
        f.write("    }\n")
        f.write("    #swagger.responses[200] = {\n")
        f.write("      description: '%s retrieved successfully.',\n" % model_name)
        f.write("      schema: { $ref: '#/definitions/%sDTO' }\n" % model_name)
        f.write("    }\n")
        f.write("    #swagger.responses[404] = { description: '%s not found' }\n" % model_name)
        f.write("    #swagger.responses[500] = { description: 'Internal Server Error' }\n")
        f.write("  */\n\n")
        f.write("  const { id } = req.params;\n\n")
        f.write("  try {\n")
        f.write(f"    const {model_name.lower()} = await get{model_name}ById(id);\n")
        f.write("    if (!%s) {\n" % model_name.lower())
        f.write("      res.status(StatusCodes.NOT_FOUND).json({ message: '%s not found' });\n" % model_name)
        f.write("      return;\n")
        f.write("    }\n")
        f.write("    res.status(StatusCodes.OK).json(%s);\n" % model_name.lower())
        f.write("  } catch (err) {\n")
        f.write("    handleError(res, err, 'Error retrieving %s');\n" % model_name.lower())
        f.write("  }\n")
        f.write("};\n\n")
        
        # Get all controller
        f.write(f"const getAll = async (req: Request, res: Response): Promise<void> => {{\n")
        f.write("  /*\n")
        f.write("    #swagger.summary = 'Get all %ss'\n" % model_name.lower())
        f.write("    #swagger.description = 'Endpoint to retrieve all %ss.'\n" % model_name.lower())
        f.write("    #swagger.responses[200] = {\n")
        f.write("      description: '%ss retrieved successfully.',\n" % model_name)
        f.write("      schema: { type: 'array', items: { $ref: '#/definitions/%sDTO' } }\n" % model_name)
        f.write("    }\n")
        f.write("    #swagger.responses[500] = { description: 'Internal Server Error' }\n")
        f.write("  */\n\n")
        f.write("  try {\n")
        f.write(f"    const {model_name.lower()}s = await get{model_name}s();\n")
        f.write("    res.status(StatusCodes.OK).json(%ss);\n" % model_name.lower())
        f.write("  } catch (err) {\n")
        f.write("    handleError(res, err, 'Error retrieving %ss');\n" % model_name.lower())
        f.write("  }\n")
        f.write("};\n\n")
        
        # Update controller
        f.write(f"const update = async (req: Request, res: Response): Promise<void> => {{\n")
        f.write("  /*\n")
        f.write("    #swagger.summary = 'Update a %s'\n" % model_name.lower())
        f.write("    #swagger.description = 'Endpoint to update an existing %s.'\n" % model_name.lower())
        f.write("    #swagger.parameters['id'] = {\n")
        f.write("      in: 'path',\n")
        f.write("      description: 'ID of the %s to update',\n" % model_name.lower())
        f.write("      required: true,\n")
        f.write("      type: 'string'\n")
        f.write("    }\n")
        f.write("    #swagger.requestBody = {\n")
        f.write("      required: true,\n")
        f.write("      content: {\n")
        f.write("        'application/json': {\n")
        f.write("          schema: { $ref: '#/definitions/Update%sDTO' }\n" % model_name)
        f.write("        }\n")
        f.write("      }\n")
        f.write("    }\n")
        f.write("    #swagger.responses[200] = {\n")
        f.write("      description: '%s updated successfully.',\n" % model_name)
        f.write("      schema: { $ref: '#/definitions/%sDTO' }\n" % model_name)
        f.write("    }\n")
        f.write("    #swagger.responses[404] = { description: '%s not found' }\n" % model_name)
        f.write("    #swagger.responses[500] = { description: 'Internal Server Error' }\n")
        f.write("  */\n\n")
        f.write("  const { id } = req.params;\n")
        f.write("  const updateData = req.body;\n\n")
        f.write("  try {\n")
        f.write(f"    const updated{model_name} = await update{model_name}(id, updateData);\n")
        f.write("    res.status(StatusCodes.OK).json(updated%s);\n" % model_name)
        f.write("  } catch (err) {\n")
        f.write("    handleError(res, err, 'Error updating %s');\n" % model_name.lower())
        f.write("  }\n")
        f.write("};\n\n")
        
        # Delete controller
        f.write(f"const remove = async (req: Request, res: Response): Promise<void> => {{\n")
        f.write("  /*\n")
        f.write("    #swagger.summary = 'Delete a %s'\n" % model_name.lower())
        f.write("    #swagger.description = 'Endpoint to delete a %s.'\n" % model_name.lower())
        f.write("    #swagger.parameters['id'] = {\n")
        f.write("      in: 'path',\n")
        f.write("      description: 'ID of the %s to delete',\n" % model_name.lower())
        f.write("      required: true,\n")
        f.write("      type: 'string'\n")
        f.write("    }\n")
        f.write("    #swagger.responses[200] = {\n")
        f.write("      description: '%s deleted successfully.',\n" % model_name)
        f.write("      schema: { $ref: '#/definitions/%sDTO' }\n" % model_name)
        f.write("    }\n")
        f.write("    #swagger.responses[404] = { description: '%s not found' }\n" % model_name)
        f.write("    #swagger.responses[500] = { description: 'Internal Server Error' }\n")
        f.write("  */\n\n")
        f.write("  const { id } = req.params;\n\n")
        f.write("  try {\n")
        f.write(f"    const deleted{model_name} = await delete{model_name}(id);\n")
        f.write("    res.status(StatusCodes.OK).json(deleted%s);\n" % model_name)
        f.write("  } catch (err) {\n")
        f.write("    handleError(res, err, 'Error deleting %s');\n" % model_name.lower())
        f.write("  }\n")
        f.write("};\n\n")
        
        f.write("export default { create, getById, getAll, update, remove };\n")

def gerar_arquivo_routes(model_name: str, folder: str):
    """Gera o arquivo de rotas."""
    with open(f"{folder}/{folder}.routes.ts", "w", encoding="utf-8") as f:
        f.write("import { Router } from 'express';\n")
        f.write("import validateRequestBody from '../../middlewares/validateRequestBody';\n")
        f.write(f"import {model_name.lower()}Controller from './{folder}.controllers';\n")
        f.write(f"import * as {model_name.lower()}Schemas from './{folder}.schemas';\n\n")
        
        f.write("const router = Router();\n\n")
        
        f.write("// read methods ---------------------------------------------------------------\n")
        f.write(f"router.get('/', {model_name.lower()}Controller.getAll);\n")
        f.write(f"router.get('/:id', {model_name.lower()}Controller.getById);\n\n")
        
        f.write("// write methods --------------------------------------------------------------\n")
        f.write(f"router.post('/', validateRequestBody({model_name.lower()}Schemas.create{model_name}Schema), {model_name.lower()}Controller.create);\n")
        f.write(f"router.put('/:id', validateRequestBody({model_name.lower()}Schemas.update{model_name}Schema), {model_name.lower()}Controller.update);\n\n")
        
        f.write("// delete methods -------------------------------------------------------------\n")
        f.write(f"router.delete('/:id', {model_name.lower()}Controller.remove);\n\n")
        
        f.write("export default router;\n")

def gerar_arquivo_index(folder: str, model_name: str):
    """Gera arquivo index.ts para exportações."""
    with open(f"{folder}/index.ts", "w", encoding="utf-8") as f:
        f.write(f"export * from './{folder}.types';\n")
        f.write(f"export * from './{folder}.schemas';\n")
        f.write(f"export * from './{folder}.services';\n")
        f.write(f"export * from './{folder}.controllers';\n")
        f.write(f"export * from './{folder}.routes';\n")

def gerar_arquivos(model_name: str, fields: List[Tuple[str, str, bool]]):
    """Gera todos os arquivos para um modelo."""
    folder = model_name.lower()
    os.makedirs(folder, exist_ok=True)
    
    gerar_arquivo_types(model_name, fields, folder)
    gerar_arquivo_schemas(model_name, fields, folder)
    gerar_arquivo_services(model_name, fields, folder)
    gerar_arquivo_controllers(model_name, fields, folder)
    gerar_arquivo_routes(model_name, folder)
    gerar_arquivo_index(folder, model_name)
    
    print(f"✓ Arquivos gerados para o model {model_name}!")

def main():
    """Função principal."""
    models = parse_prisma_models(PRISMA_FILE)
    
    if not models:
        print("❌ Nenhum modelo encontrado no schema.prisma")
        return
    
    print("📋 Modelos encontrados no schema.prisma:", ", ".join(models.keys()))
    
    selecionados = input("💡 Digite os modelos que deseja gerar (separados por vírgula) ou 'all' para todos: ")
    
    if selecionados.strip().lower() == 'all':
        selecionados = list(models.keys())
    else:
        selecionados = [m.strip() for m in selecionados.split(",") if m.strip()]
    
    for model_name in selecionados:
        if model_name in models:
            gerar_arquivos(model_name, models[model_name])
        else:
            print(f"⚠️  Atenção: modelo '{model_name}' não encontrado no schema.prisma")

if __name__ == "__main__":
    main()