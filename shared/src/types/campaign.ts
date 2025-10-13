import type { DateTime } from "./common";
import type {
  CampaignCharacterRole,
  CampaignMemberRole,
} from "../enums";
import type { CharacterDTO } from "./character";
import type { UserDTO } from "./user";

export interface CampaignDTO {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isFinished: boolean;
  creatorId: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateCampaignDTO {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  isFinished?: boolean;
  creatorId: string;
}

export type UpdateCampaignDTO = Partial<CreateCampaignDTO>;

export interface DeleteCampaignDTO {
  id: string;
}

export interface CharacterPerCampaignDTO {
  id: string;
  campaignId: string;
  characterId: string;
  role: CampaignCharacterRole;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateCharacterPerCampaignDTO {
  campaignId: string;
  characterId: string;
  role?: CampaignCharacterRole;
}

export type UpdateCharacterPerCampaignDTO =
  Partial<CreateCharacterPerCampaignDTO>;

export interface DeleteCharacterPerCampaignDTO {
  id: string;
}

export interface CharacterPerCampaignWithCharacterDTO
  extends CharacterPerCampaignDTO {
  character: CharacterDTO | null;
}

export interface CampaignMemberDTO {
  id: string;
  status: string | null;
  role: CampaignMemberRole;
  campaignId: string;
  userId: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateCampaignMemberDTO {
  status?: string | null;
  role?: CampaignMemberRole;
  campaignId: string;
  userId: string;
}

export type UpdateCampaignMemberDTO = Partial<CreateCampaignMemberDTO>;

export interface DeleteCampaignMemberDTO {
  id: string;
}

export interface CampaignMemberWithUserDTO extends CampaignMemberDTO {
  user: UserDTO | null;
}
