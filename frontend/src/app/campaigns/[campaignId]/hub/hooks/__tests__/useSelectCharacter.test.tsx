import { renderHook, act } from "@testing-library/react";
import { useSelectCharacter } from "../useSelectCharacter";
import type { Character } from "@/types/models";
import { CharacterType } from "@rpg/shared";

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

describe("useSelectCharacter", () => {
  it("alterna o foco ao clicar no mesmo card", () => {
    const orderedCharacters = [
      createCharacter({ id: "char-1", name: "Herói" }),
      createCharacter({ id: "char-2", name: "Mago" }),
    ];

    const { result } = renderHook(() =>
      useSelectCharacter({
        isMaster: true,
        playerCharacterId: null,
        orderedCharacters,
      }),
    );

    act(() => {
      result.current.handleFocusCard("char-1");
    });
    expect(result.current.focusedCardId).toBe("char-1");

    act(() => {
      result.current.handleFocusCard("char-1");
    });
    expect(result.current.focusedCardId).toBeNull();
  });

  it("garante foco no personagem do jogador quando não é mestre", () => {
    const orderedCharacters = [
      createCharacter({ id: "char-1" }),
      createCharacter({ id: "char-2" }),
    ];

    const { result } = renderHook(() =>
      useSelectCharacter({
        isMaster: false,
        playerCharacterId: "char-2",
        orderedCharacters,
      }),
    );

    let focusedId: string | null = null;
    act(() => {
      focusedId = result.current.ensureAndGetFocus();
    });
    expect(focusedId).toBe("char-2");
    expect(result.current.focusedCardId).toBe("char-2");
  });

  it("garante foco no primeiro personagem quando é mestre e nenhum foco definido", () => {
    const orderedCharacters = [
      createCharacter({ id: "char-10" }),
      createCharacter({ id: "char-20" }),
    ];

    const { result } = renderHook(() =>
      useSelectCharacter({
        isMaster: true,
        playerCharacterId: null,
        orderedCharacters,
      }),
    );

    let focusedId: string | null = null;
    act(() => {
      focusedId = result.current.ensureAndGetFocus();
    });
    expect(focusedId).toBe("char-10");
    expect(result.current.focusedCardId).toBe("char-10");
  });
});
