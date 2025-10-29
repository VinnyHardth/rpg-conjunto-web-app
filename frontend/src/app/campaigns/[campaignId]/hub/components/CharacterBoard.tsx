import CharacterCard from "@/components/CharacterCard";
import { useMemo } from "react";
import { CharacterPerCampaignWithCharacter } from "@/types/models";
import { useCampaignHub } from "../contexts/CampaignHubContext";

type Relation = CharacterPerCampaignWithCharacter;

export default function CharacterBoard() {
  const {
    isMaster,
    user,
    disableSelection,
    useCampaignData: { relations },
    useCharacterManagement: {
      orderedCharacters,
      removingId,
      handleDetachCharacter,
    },
    useDiceRolls: { rollsByCharacter, difficultyTarget },
    useHubInterface: { boardRef, openSelection },
    useSelectCharacter: { focusedCardId, handleFocusCard },
  } = useCampaignHub();

  const loadingState = false; // Obter do contexto se necessário

  const relationsByCharacterId = useMemo(() => {
    const map: Record<string, Relation> = {};
    relations?.forEach((relation) => {
      if (relation.characterId) {
        map[relation.characterId] = relation;
      }
    });
    return map;
  }, [relations]);

  return (
    <section className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg backdrop-blur">
      {isMaster && (
        <button
          type="button"
          onClick={openSelection}
          disabled={disableSelection}
          className="absolute right-6 top-6 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 p-2 text-xs font-medium text-slate-200 opacity-60 transition hover:border-white/40 hover:text-white hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/20"
          aria-label="Adicionar personagem"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      {loadingState ? (
        <div className="flex justify-center py-12">
          <p className="text-sm text-slate-400">Carregando quadro...</p>
        </div>
      ) : orderedCharacters.length === 0 ? (
        <div className="flex justify-center py-12">
          <p className="text-sm text-slate-400">Nenhum personagem vinculado.</p>
        </div>
      ) : (
        <div className="flex justify-center">
          <div
            ref={boardRef}
            className="grid grid-rows-2 grid-flow-col auto-cols-[minmax(240px,240px)] gap-x-4 gap-y-4 justify-items-center px-2"
          >
            {orderedCharacters.map((character) => {
              const isOwner = character.userId === user?.id;
              const relation = relationsByCharacterId[character.id];
              const characterRoll = rollsByCharacter[character.id];
              const cardRollSummary = characterRoll
                ? {
                    label: characterRoll.attributeAbbreviation,
                    total: characterRoll.total,
                    ...(difficultyTarget !== null
                      ? {
                          isSuccess: characterRoll.total >= difficultyTarget,
                        }
                      : {}),
                  }
                : null;

              return (
                <div
                  key={character.id}
                  className={`group relative rounded-xl border border-white/10 p-1 transition-transform duration-200 ${
                    focusedCardId === character.id
                      ? "bg-slate-100 ring-4 ring-blue-400 ring-offset-2 ring-offset-slate-950 shadow-xl"
                      : focusedCardId
                        ? "bg-slate-950/70 opacity-50 hover:opacity-80"
                        : "bg-slate-900/40"
                  }`}
                >
                  {isMaster && relation && (
                    <button
                      type="button"
                      className={`absolute right-2 top-2 inline-flex items-center justify-center rounded-full bg-red-600/90 p-[3px] text-red-100 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-wait disabled:bg-red-700/60 disabled:text-red-200 ${removingId === relation.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} z-20`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDetachCharacter(relation);
                      }}
                      disabled={removingId === relation.id}
                      aria-label="Remover personagem da campanha"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 6h16M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V6h10Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}

                  <CharacterCard
                    character={character}
                    onClick={() => handleFocusCard(character.id)}
                    disableHoverEffect
                    className="h-full"
                    nameSuffix={isOwner ? "•" : undefined}
                    rollSummary={cardRollSummary}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
