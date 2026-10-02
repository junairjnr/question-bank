import type { AnswerState } from "./types";

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );

export const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0);

export const fmt = (s: number) => {
  const t = Math.max(0, Math.round(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

export const shuffle = <T,>(a: T[]) => {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function score(ids: string[], ans: Record<string, AnswerState>) {
  let c = 0;
  let w = 0;
  ids.forEach((i) => {
    const a = ans[i];
    if (a?.selectedAnswerId) {
      if (a.isCorrect) c++;
      else w++;
    }
  });
  return { c, w, u: ids.length - c - w, n: ids.length, p: pct(c, ids.length) };
}
