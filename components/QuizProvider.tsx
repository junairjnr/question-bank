"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { fmt, score, shuffle, uid } from "@/lib/helpers";
import { K, Store } from "@/lib/storage";
import type {
  HistoryEntry,
  Progress,
  Question,
  QuizSession,
  Settings,
  StartOptions,
} from "@/lib/types";

type Ctx = {
  ready: boolean;
  Q: Question[];
  BY: Record<string, Question>;
  PL: Question[];
  SECS: string[];
  prog: Progress;
  sess: QuizSession | null;
  hist: HistoryEntry[];
  set: Settings;
  start: (o: StartOptions) => void;
  finish: () => void;
  answer: (id: string) => void;
  go: (i: number) => void;
  toggleTheme: () => void;
  timerLabel: string;
};

const QuizCtx = createContext<Ctx | null>(null);

export function useQuiz() {
  const v = useContext(QuizCtx);
  if (!v) throw new Error("useQuiz outside provider");
  return v;
}

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [Q, setQ] = useState<Question[]>([]);
  const [prog, setProg] = useState<Progress>({ answers: {} });
  const [sess, setSess] = useState<QuizSession | null>(null);
  const [hist, setHist] = useState<HistoryEntry[]>([]);
  const [set, setSet] = useState<Settings>({ theme: "auto" });
  const [timerLabel, setTimerLabel] = useState("");

  const BY = useMemo(() => Object.fromEntries(Q.map((q) => [q.id, q])), [Q]);
  const PL = Q;
  const SECS = useMemo(() => [...new Set(Q.map((q) => q.section))], [Q]);

  const sessRef = useRef(sess);
  sessRef.current = sess;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/questions.json");
      const data = (await res.json()) as Question[];
      if (cancelled) return;
      setQ(data);
      setProg(
        Store.r(K.PROG, { answers: {} }, (v): v is Progress =>
          Boolean(v && typeof v === "object" && v !== null && "answers" in v && typeof (v as Progress).answers === "object"),
        ),
      );
      setSess(
        Store.r(K.SESS, null, (v): v is QuizSession | null =>
          v === null ||
          (Boolean(v && typeof v === "object") &&
            Array.isArray((v as QuizSession).questionIds) &&
            typeof (v as QuizSession).answers === "object"),
        ),
      );
      setHist(Store.r(K.HIST, [], Array.isArray));
      setSet(
        Store.r(K.SET, { theme: "auto" }, (v): v is Settings =>
          Boolean(v && typeof v === "object"),
        ),
      );
      Store.w(K.BANK, { count: data.length, playable: data.filter((q) => q.playable).length });
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (set.theme !== "auto") document.documentElement.dataset.theme = set.theme;
    else delete document.documentElement.dataset.theme;
  }, [set.theme]);

  const saveSess = useCallback((s: QuizSession | null) => {
    if (!s) return;
    const next = { ...s, lastUpdatedAt: new Date().toISOString() };
    Store.w(K.SESS, next);
    setSess(next);
  }, []);

  const saveProg = useCallback((p: Progress) => {
    Store.w(K.PROG, p);
    setProg(p);
  }, []);

  const start = useCallback(
    (o: StartOptions) => {
      if (
        sessRef.current &&
        !sessRef.current.completed &&
        !confirm(
          "Starting a new quiz will replace your unfinished quiz (your saved answers and statistics are kept). Continue?",
        )
      )
        return;
      let pool = PL.filter(
        (q) =>
          (!o.section || q.section === o.section) &&
          (!o.difficulty || q.difficulty === o.difficulty),
      );
      if (o.pool === "incorrect")
        pool = pool.filter((q) => prog.answers[q.id] && !prog.answers[q.id].isCorrect);
      if (o.pool === "unanswered") pool = pool.filter((q) => !prog.answers[q.id]);
      if (!pool.length) {
        alert("No questions match this selection.");
        return;
      }
      let ids = o.shuffle ? shuffle(pool.map((q) => q.id)) : pool.map((q) => q.id);
      if (o.count && o.count < ids.length) ids = ids.slice(0, o.count);
      const mode =
        o.pool || (o.section ? "section" : o.difficulty ? "difficulty" : o.shuffle ? "random" : "all");
      const next: QuizSession = {
        id: uid(),
        mode,
        label: o.label || mode,
        section: o.section || "",
        difficulty: o.difficulty || "",
        questionIds: ids,
        currentQuestionIndex: 0,
        answers: {},
        startedAt: new Date().toISOString(),
        lastUpdatedAt: "",
        completed: false,
        elapsed: 0,
        endAt: o.timer ? Date.now() + o.timer * 60000 : 0,
      };
      saveSess(next);
      router.push("/quiz");
    },
    [PL, prog.answers, router, saveSess],
  );

  const finish = useCallback(() => {
    const s = sessRef.current;
    if (!s || s.completed) return;
    const done = { ...s, completed: true };
    Store.w(K.SESS, { ...done, lastUpdatedAt: new Date().toISOString() });
    setSess(done);
    const sc = score(done.questionIds, done.answers);
    const entry: HistoryEntry = {
      ...done,
      completedAt: new Date().toISOString(),
      totalQuestions: sc.n,
      answeredQuestions: sc.c + sc.w,
      correctAnswers: sc.c,
      incorrectAnswers: sc.w,
      unansweredQuestions: sc.u,
      scorePercentage: sc.p,
      timeSec: done.elapsed,
      timed: !!done.endAt,
    };
    setHist((prev) => {
      const nextHist = [entry, ...prev];
      Store.w(K.HIST, nextHist);
      return nextHist;
    });
    router.push(`/result/${done.id}`);
  }, [router]);

  const answer = useCallback(
    (id: string) => {
      const s = sessRef.current;
      if (!s || s.completed) return;
      const q = BY[s.questionIds[s.currentQuestionIndex]];
      if (s.answers[q.id]) return;
      const st = {
        questionId: q.id,
        selectedAnswerId: id,
        isCorrect: id === q.correctAnswerId,
        answeredAt: new Date().toISOString(),
      };
      const nextSess = { ...s, answers: { ...s.answers, [q.id]: st } };
      const nextProg = { answers: { ...prog.answers, [q.id]: st } };
      saveProg(nextProg);
      saveSess(nextSess);
    },
    [BY, prog.answers, saveProg, saveSess],
  );

  const go = useCallback(
    (i: number) => {
      const s = sessRef.current;
      if (!s) return;
      saveSess({
        ...s,
        currentQuestionIndex: Math.min(Math.max(0, i), s.questionIds.length - 1),
      });
    },
    [saveSess],
  );

  const toggleTheme = useCallback(() => {
    const dk = getComputedStyle(document.body).backgroundColor === "rgb(10, 20, 36)";
    const theme = dk ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    const next = { theme: theme as Settings["theme"] };
    Store.w(K.SET, next);
    setSet(next);
  }, []);

  useEffect(() => {
    const tick = () => {
      const s = sessRef.current;
      if (!s || s.completed) return;
      if (s.endAt) setTimerLabel(`⏱ ${fmt((s.endAt - Date.now()) / 1000)} left`);
      else setTimerLabel(`⏱ ${fmt(s.elapsed)}`);
    };
    tick();
    const id = setInterval(() => {
      if (typeof window !== "undefined" && window.location.pathname !== "/quiz") return;
      const s = sessRef.current;
      if (!s || s.completed) return;
      const next = { ...s, elapsed: s.elapsed + 1 };
      sessRef.current = next;
      setSess(next);
      if (next.elapsed % 5 === 0) Store.w(K.SESS, { ...next, lastUpdatedAt: new Date().toISOString() });
      if (next.endAt && Date.now() >= next.endAt) {
        finish();
        return;
      }
      tick();
    }, 1000);
    return () => clearInterval(id);
  }, [finish]);

  const value: Ctx = {
    ready,
    Q,
    BY,
    PL,
    SECS,
    prog,
    sess,
    hist,
    set,
    start,
    finish,
    answer,
    go,
    toggleTheme,
    timerLabel,
  };

  return <QuizCtx.Provider value={value}>{children}</QuizCtx.Provider>;
}
