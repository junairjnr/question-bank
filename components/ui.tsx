import { esc } from "@/lib/helpers";
import type { Question } from "@/lib/types";

export function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="bar h-2 overflow-hidden rounded bg-[var(--ln)]"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i className="block h-full bg-[var(--ac)]" style={{ width: `${value}%` }} />
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card stat rounded-[10px] border border-[var(--ln)] bg-[var(--pn)] p-4">
      <b className="block font-mono text-[28px] font-medium">{value}</b>
      <span className="text-[13px] text-[var(--mut)]">{label}</span>
    </div>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[20px] border border-[var(--ln)] px-2 py-px text-xs text-[var(--mut)]">
      {children}
    </span>
  );
}

export function OptionList({
  q,
  selected,
  locked,
  onSelect,
}: {
  q: Question;
  selected?: string;
  locked: boolean;
  onSelect?: (id: string) => void;
}) {
  return (
    <>
      {q.options.map((o, idx) => {
        const isC = o.id === q.correctAnswerId;
        const isS = o.id === selected;
        let cls = "";
        let tag = "";
        if (locked && isC) {
          cls = "ok";
          tag = "✓ Correct";
        } else if (locked && isS) {
          cls = "no";
          tag = "✗ Your answer";
        }
        if (locked && isC && isS) tag = "✓ Correct (your answer)";
        return (
          <button
            key={`${o.id}-${idx}`}
            type="button"
            disabled={locked}
            onClick={() => onSelect?.(o.id)}
            className={`opt mb-2 flex min-h-[52px] w-full flex-wrap items-start gap-x-3 gap-y-1 rounded-[10px] border-[1.5px] border-[var(--ln)] bg-[var(--pn)] p-3.5 text-left text-[var(--ink)] enabled:hover:border-[var(--ac)] disabled:cursor-default sm:flex-nowrap ${cls === "ok" ? "border-[var(--ok)] bg-[var(--okb)]" : ""} ${cls === "no" ? "border-[var(--no)] bg-[var(--nob)]" : ""}`}
            aria-label={`Option ${o.id.toUpperCase()}: ${o.text} ${tag}`}
          >
            <span className="k shrink-0 rounded border border-[var(--ln)] px-1.5 py-px font-mono text-sm">
              {o.id.toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 break-words">{esc(o.text)}</span>
            {tag ? (
              <span
                className={`w-full text-[13px] font-semibold sm:ml-auto sm:w-auto sm:whitespace-nowrap ${cls === "ok" ? "text-[var(--ok)]" : "text-[var(--no)]"}`}
              >
                {tag}
              </span>
            ) : null}
          </button>
        );
      })}
    </>
  );
}

export function Flags({ q }: { q: Question }) {
  if (!q.needsReview.length) return null;
  return (
    <p className="text-[var(--ac)]">⚠ Flagged for review: {esc(q.needsReview.join("; "))}</p>
  );
}
