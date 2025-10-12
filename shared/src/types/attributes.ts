import type { AttributeKind } from "../enums";

export interface AttributesDTO {
  id: string;
  name: string;
  kind: AttributeKind;
}

export interface CreateAttributesDTO {
  name: string;
  kind: AttributeKind;
}

export type UpdateAttributesDTO = Partial<CreateAttributesDTO>;

export interface DeleteAttributesDTO {
  id: string;
}
