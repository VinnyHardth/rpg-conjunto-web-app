import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import type { Mock } from "vitest";
import { useDamagePanel } from "../useDamagePanel";
import type { Character } from "@/types/models";
import { statusCacheKey } from "@/hooks/useStatus";
import { rollCustom, applyEffectTurn } from "@/lib/api";
import type { RollCustomResponse } from "@/lib/api";
import type { EffectDTO } from "@rpg/shared";
import {
  DamageType,
  StackingPolicy,
  CharacterType,
  SourceType,
} from "@rpg/shared";

vi.mock("@/lib/api", () => ({
  rollCustom: vi.fn(),
  applyEffectTurn: vi.fn(),
}));

const swrModule = vi.hoisted(() => ({
  mutate: vi.fn(),
}));

vi.mock("swr", () => swrModule);

const rollCustomMock = vi.mocked(rollCustom);
const applyEffectTurnMock = vi.mocked(applyEffectTurn);
const mutateMock = swrModule.mutate as Mock;

const createCharacter = (overrides: Partial<Character>): Character => ({
  id: "character-base",
  name: "Base",
  race: null,
  age: null,
  height: null,
  gender: "M",
  money: 0,
  annotations: null,
  generation: 1,
  type: CharacterType.PC,
  imageUrl: null,
  userId: "user-base",
  archetypeId: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  deletedAt: null,
  ...overrides,
});

const createEffect = (overrides: Partial<EffectDTO>): EffectDTO => ({
  id: "effect-base",
  name: "Dano Físico",
  imgUrl: null,
  description: null,
  removableBy: null,
  damageType: DamageType.PHISICAL,
  stackingPolicy: StackingPolicy.REFRESH,
  baseDuration: 0,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  deletedAt: null,
  ...overrides,
});

const characters: Character[] = [
  createCharacter({ id: "char-1", name: "Herói" }),
  createCharacter({ id: "char-2", name: "Mago" }),
];

const baseProps = {
  isMaster: true,
  characters,
  effects: [createEffect({ id: "effect-physical" })],
  effectsLoading: false,
  focusedCharacterId: null as string | null,
};

const rollResponse: RollCustomResponse = {
  expression: "1d20",
  renderedExpression: "1d20",
  total: 10,
  successes: 0,
  failures: 0,
  rolls: [10],
};

describe("useDamagePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateMock.mockResolvedValue(undefined);
  });

  it("inicia com o efeito disponível quando configurado", () => {
    const { result } = renderHook(() => useDamagePanel(baseProps));

    expect(result.current.effectAvailable).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.roll).toBeNull();
  });

  it("retorna erro ao tentar rolar sem fórmula", async () => {
    const { result } = renderHook(() => useDamagePanel(baseProps));

    await act(() => result.current.handleRoll());

    expect(result.current.error).toBe("Informe uma fórmula antes de rolar.");
    expect(rollCustomMock).not.toHaveBeenCalled();
  });

  it("realiza rolagem com sucesso e atualiza mensagem", async () => {
    rollCustomMock.mockResolvedValueOnce(rollResponse);
    const { result } = renderHook(() => useDamagePanel(baseProps));

    act(() => {
      result.current.setFormula("1d20");
    });

    await act(() => result.current.handleRoll());

    expect(rollCustomMock).toHaveBeenCalledWith("1d20");
    expect(result.current.roll).toEqual(rollResponse);
    expect(result.current.message).toBe("Rolagem concluída. Total: 10.");
    expect(result.current.error).toBeNull();
  });

  it("não permite aplicar sem selecionar alvo", async () => {
    const { result } = renderHook(() => useDamagePanel(baseProps));

    await act(() => result.current.handleApply());

    expect(result.current.error).toBe(
      "Selecione um alvo para aplicar a alteração.",
    );
    expect(applyEffectTurnMock).not.toHaveBeenCalled();
  });

  it("aplica alteração para alvo único e invalida cache", async () => {
    rollCustomMock.mockResolvedValueOnce(rollResponse);
    applyEffectTurnMock.mockResolvedValueOnce({
      immediate: { results: [{ delta: -5 }] },
    });
    const { result } = renderHook(() => useDamagePanel(baseProps));

    act(() => {
      result.current.setFormula("1d20");
    });
    await act(() => result.current.handleRoll());
    act(() => {
      result.current.setSelectedTargetId("char-1");
    });
    await act(() => result.current.handleApply());

    expect(applyEffectTurnMock).toHaveBeenCalledWith({
      characterId: "char-1",
      effectId: "effect-physical",
      sourceType: SourceType.OTHER,
      duration: 0,
      valuePerStack: -10,
    });
    expect(mutateMock).toHaveBeenCalledWith(statusCacheKey("char-1"));
    expect(result.current.roll).toBeNull();
    expect(result.current.message).toBe(
      "Dano Físico (10 ➔ 5) em Herói aplicado com sucesso.",
    );
  });

  it("aplica alteração em todos os personagens quando selecionado 'ALL_CHARACTERS'", async () => {
    rollCustomMock.mockResolvedValueOnce(rollResponse);
    applyEffectTurnMock.mockResolvedValue({
      immediate: { results: [] },
    });
    const { result } = renderHook(() => useDamagePanel(baseProps));

    act(() => {
      result.current.setFormula("1d20");
    });
    await act(() => result.current.handleRoll());
    act(() => {
      result.current.setSelectedTargetId("ALL_CHARACTERS");
    });
    await act(() => result.current.handleApply());

    expect(applyEffectTurnMock).toHaveBeenCalledTimes(characters.length);
    for (const character of characters) {
      expect(applyEffectTurnMock).toHaveBeenCalledWith({
        characterId: character.id,
        effectId: "effect-physical",
        sourceType: SourceType.OTHER,
        duration: 0,
        valuePerStack: -10,
      });
    }
    expect(mutateMock).toHaveBeenCalledTimes(characters.length);
    expect(result.current.message).toBe(
      "Dano Físico (10) aplicado a todos os personagens com sucesso.",
    );
  });
});
