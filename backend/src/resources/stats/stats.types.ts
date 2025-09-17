import { Stats } from "@prisma/client";

type createStatsDTO = Pick<Stats, "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma" | "destiny" | "characterId">;
type updateStatsDTO = Partial<createStatsDTO>;
type deleteStatsDTO = Pick<Stats, "id">;
type StatsDTO = Stats;

export { StatsDTO, createStatsDTO, updateStatsDTO, deleteStatsDTO };