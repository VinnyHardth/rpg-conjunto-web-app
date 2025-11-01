type AttributeRow = {
  id: string | null;
  name: string;
  base: number;
  inventory: number;
  extra: number;
  total: number;
};

interface AttributeTableProps {
  title: string;
  firstColumnLabel: string;
  rows: AttributeRow[];
  headerClass: string;
  selectedRowName: string | null;
  onSelectRow: (rowName: string) => void;
  canEditExtra?: boolean;
  editingRowId?: string | null;
  draftExtraValue?: number;
  onStartEditExtra?: (row: AttributeRow) => void;
  onDraftExtraChange?: (nextValue: number) => void;
  onSubmitExtra?: () => void;
  onCancelExtra?: () => void;
  isSubmittingExtra?: boolean;
}

const AttributeTable = ({
  title,
  firstColumnLabel,
  rows,
  headerClass,
  selectedRowName,
  onSelectRow,
  canEditExtra = false,
  editingRowId,
  draftExtraValue,
  onStartEditExtra,
  onDraftExtraChange,
  onSubmitExtra,
  onCancelExtra,
  isSubmittingExtra,
}: AttributeTableProps) => (
  <div className="mb-6 overflow-hidden rounded-xl border border-white/10 bg-slate-900/40">
    <div
      className={`${headerClass} px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white`}
    >
      {title}
    </div>
    <table className="w-full text-xs text-slate-200">
      <thead>
        <tr className="bg-slate-900/50 uppercase tracking-widest text-[10px] text-slate-400">
          <th className="px-3 py-2 text-left">{firstColumnLabel}</th>
          <th className="px-3 py-2 text-right">Base</th>
          <th className="px-3 py-2 text-right">Inv.</th>
          <th className="px-3 py-2 text-right">Extra</th>
          <th className="px-3 py-2 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const isSelected = selectedRowName === row.name;
          return (
            <tr
              key={row.name}
              role="button"
              tabIndex={0}
              onClick={() => onSelectRow(row.name)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectRow(row.name);
                }
              }}
              className={`border-b border-white/5 last:border-b-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                isSelected
                  ? "cursor-pointer bg-blue-500/20 text-white"
                  : "cursor-pointer odd:bg-slate-900/20 even:bg-slate-900/10 hover:bg-slate-900/30"
              }`}
            >
              <td className="px-3 py-1.5 text-left font-medium text-white">
                {row.name}
              </td>
              <td className="px-3 py-1.5 text-right">{row.base}</td>
              <td className="px-3 py-1.5 text-right">{row.inventory}</td>
              <td className="px-3 py-1.5 text-right">
                {editingRowId === row.id ? (
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <input
                      type="number"
                      className="w-16 rounded border border-white/20 bg-slate-900 px-1 py-0.5 text-right text-xs text-white focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={draftExtraValue ?? 0}
                      onChange={(event) => {
                        const parsed = Number(event.target.value);
                        onDraftExtraChange?.(Number.isNaN(parsed) ? 0 : parsed);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          onSubmitExtra?.();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          onCancelExtra?.();
                        }
                      }}
                      disabled={isSubmittingExtra}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="rounded bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-900"
                      onClick={onSubmitExtra}
                      disabled={isSubmittingExtra}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      className="rounded bg-transparent px-1 py-0.5 text-[11px] font-semibold text-slate-300 transition hover:text-white disabled:cursor-not-allowed"
                      onClick={onCancelExtra}
                      disabled={isSubmittingExtra}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`block w-full rounded px-1 text-right text-xs ${
                      canEditExtra && row.id
                        ? "text-blue-200 transition hover:bg-slate-900/40 hover:text-white"
                        : "cursor-default text-slate-200"
                    }`}
                    onClick={() => {
                      if (!canEditExtra || !row.id) return;
                      onStartEditExtra?.(row);
                    }}
                    disabled={!canEditExtra || !row.id}
                  >
                    {row.extra}
                  </button>
                )}
              </td>
              <td className="px-3 py-1.5 text-right font-semibold text-white">
                {row.total}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export type { AttributeRow };
export default AttributeTable;
