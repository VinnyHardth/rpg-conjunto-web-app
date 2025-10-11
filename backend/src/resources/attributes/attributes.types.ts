import { Attributes } from "@prisma/client";

type CreateAttributesDTO = Pick<Attributes, "name" | "kind">;
type UpdateAttributesDTO = Partial<CreateAttributesDTO>;
type AttributesDTO = Attributes;
type DeleteAttributesDTO = Pick<Attributes, "id">;

export type {
  CreateAttributesDTO,
  UpdateAttributesDTO,
  AttributesDTO,
  DeleteAttributesDTO,
};
