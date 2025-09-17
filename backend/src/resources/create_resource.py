import os

def criar_estrutura(nome_pasta):
    # Cria a pasta com o nome fornecido
    if not os.path.exists(nome_pasta):
        os.makedirs(nome_pasta)

    # Lista dos arquivos a serem criados
    arquivos = ['controller', 'router', 'services', 'schemas','types']

    for arquivo in arquivos:
        nome_arquivo = f"{nome_pasta}/{nome_pasta}.{arquivo}.ts"
        with open(nome_arquivo, 'w') as f:
            # Escreve algum conteúdo básico no arquivo
            # f.write(f'// Este é o arquivo {nome_arquivo}\n')
            # f.write('// Insira seu código aqui\n')
            # Adiciona código específico para controller e router
            if arquivo == 'controller':
                f.write("import { PrismaClient } from '@prisma/client';\n")
                f.write("import { Request, Response } from 'express';\n")
                f.write("import { ReasonPhrases, StatusCodes } from 'http-status-codes';\n\n")
                f.write('import ' + nome_pasta.capitalize() + 'Services from "./' + nome_pasta + ".services;")
            elif arquivo == 'router':
                f.write("\nimport { Router } from 'express';\n\n")
                f.write('import validateRequestBody from "../../middlewares/validateRequestBody";\n')
                f.write("import " + nome_pasta + "Controller from './" + nome_pasta + ".controller';\n")
                f.write("import " + nome_pasta + "Schema from './" + nome_pasta + ".schemas';\n")
                f.write("const router = Router();\n\n")
                f.write("// read methods ---------------------------------------------------------------\n")
                f.write("router.get('/', " + nome_pasta + "Controller.getAll);\n")
                f.write("router.get('/:id', " + nome_pasta + "Controller.get);\n\n")
                f.write("// write methods ---------------------------------------------------------------\n")
                f.write("router.post('/', validateRequestBody(" + nome_pasta + "Schemas.post), " + nome_pasta +"Controller.create);\n")
                f.write("router.put('/:id', validateRequestBody(" + nome_pasta + "Schemas.put), " + nome_pasta +"Controller.update);\n")
                f.write("// delete methods -------------------------------------------------------------\n")
                f.write("router.delete('/:id', " + nome_pasta + "Controller.remove);\n\n")
                f.write("export default router;\n")
            
            elif arquivo == 'services':
                f.write('import { PrismaClient } from "@prisma/client";')

            elif arquivo == 'schemas':
                f.write('import Joi from "joi";')

            elif arquivo == 'types':
                f.write('import { ' + nome_pasta.capitalize() + ' } from "@prisma/client";')

    print(f'Estrutura criada com sucesso em {nome_pasta}!')

# Chamada da função para criar a estrutura com o nome desejado
nome = input("Digite o nome da pasta: ")
criar_estrutura(nome)