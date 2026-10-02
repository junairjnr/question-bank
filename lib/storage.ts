export const K = {
  BANK: "pilot_question_bank",
  PROG: "pilot_user_progress",
  SESS: "pilot_quiz_sessions",
  HIST: "pilot_quiz_history",
  SET: "pilot_settings",
} as const;

export const Store = {
  r<T>(k: string, d: T, ok: (v: unknown) => v is T): T {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(k);
      if (raw === null) return d;
      const v = JSON.parse(raw) as unknown;
      if (ok(v)) return v;
      throw 0;
    } catch {
      try {
        if (raw) localStorage.setItem(`${k}_corrupt_backup`, raw);
      } catch {
        /* ignore */
      }
      return d;
    }
  },
  w(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  },
};
