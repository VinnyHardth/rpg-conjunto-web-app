import CharacterCard from "@/components/CharacterCard";
import { Character, User } from "@/types/models";

type CharacterSelectionProps = {
  availableCharacters: Character[];
  user: User | null;
  isSaving: boolean;
  handleAttachCharacter: (character: Character) => void;
  closeSelection: () => void;
  actionError: string | null;
  isAttributesOpen: boolean;
};

export default function CharacterSelection({
  availableCharacters,
  user,
  isSaving,
  handleAttachCharacter,
  closeSelection,
  actionError,
  isAttributesOpen,
}: CharacterSelectionProps) {
  return (
    <section
      className={`rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg backdrop-blur ${
        isAttributesOpen ? "ml-[360px]" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Escolha um personagem</h2>
        <button
          type="button"
          onClick={closeSelection}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          Cancelar
        </button>
      </div>

      {availableCharacters.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum personagem disponível.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableCharacters.map((character) => (
            <div
              key={character.id}
              className="rounded-xl border border-white/5 bg-white/[0.04] p-2 transition hover:border-white/20"
            >
              <CharacterCard
                character={character}
                onClick={() => {
                  if (isSaving) return;
                  handleAttachCharacter(character);
                }}
                nameSuffix={character.userId === user?.id ? "•" : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {actionError && (
        <p className="mt-4 text-sm text-red-200">{actionError}</p>
      )}
    </section>
  );
}
