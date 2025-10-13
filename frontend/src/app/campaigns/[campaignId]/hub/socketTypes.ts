import type { CharacterPerCampaignWithCharacter, Status } from "@/types/models";

export interface CampaignCharacterEventPayload {
  campaignId: string;
  relation: CharacterPerCampaignWithCharacter;
}

export interface StatusUpdatedPayload {
  campaignId: string;
  characterId: string;
  status: Status;
  statuses: Status[];
}
