"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuiz } from "@/components/QuizProvider";
import { ProgressBar, Stat } from "@/components/ui";
import { pct } from "@/lib/helpers";

export default function DashboardPage() {
  const { Q, PL, SECS, prog, sess, hist, start } = useQuiz();
  const [section, setSection] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [count, setCount] = useState("20");
  const [timer, setTimer] = useState("0");
  const [shuffleOn, setShuffleOn] = useState(true);

  const answered = PL.map((q) => prog.answers[q.id]).filter(Boolean);
  const correct = answered.filter((a) => a!.isCorrect).length;
  const wrong = answered.length - correct;
  const best = hist.reduce((m, h) => Math.max(m, h.scorePercentage), 0);
  const inc = PL.filter((q) => prog.answers[q.id] && !prog.answers[q.id].isCorrect).length;
  const un = PL.length - answered.length;

  const customStart = () => {
    let n = count;
    let t = timer;
    if (n === "x") n = prompt("Number of questions?", "25") ?? "0";
    if (t === "x") t = prompt("Minutes?", "40") ?? "0";
    start({
      section,
      difficulty,
      count: +n || 0,
      shuffle: shuffleOn,
      timer: +t || 0,
      label: `${section || "Custom"} practice`,
    });
  };

  return (
    <>
      <h1 className="font-[family-name:var(--font-barlow)] text-[clamp(1.75rem,6vw,2.5rem)] font-semibold tracking-wide">
        Ready for check ride?
      </h1>
      <p className="text-[var(--mut)]">
        {PL.length} practice questions across {SECS.length} subjects, from your PDFs.
        {Q.length > PL.length
          ? ` ${Q.length - PL.length} more are in the bank but incomplete in the source (see Question Bank → Needs review).`
          : ""}
      </p>

      {sess && !sess.completed ? (
        <div className="card mt-4 rounded-[10px] border border-[var(--ac)] bg-[var(--pn)] p-4">
          <h2 className="font-[family-name:var(--font-barlow)] text-xl font-semibold">Unfinished quiz</h2>
          <p>
            {sess.label} · Question {sess.currentQuestionIndex + 1} of {sess.questionIds.length}
          </p>
          <ProgressBar value={pct(Object.keys(sess.answers).length, sess.questionIds.length)} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link href="/quiz" className="btn ac inline-block">
              Continue
            </Link>
            <span className="text-[13px] text-[var(--mut)]">
              Starting a new quiz replaces this session (with confirmation).
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
        <Stat value={`${answered.length} / ${PL.length}`} label="Answered" />
        <Stat value={String(PL.length - answered.length)} label="Remaining" />
        <Stat value={String(correct)} label="Correct" />
        <Stat value={String(wrong)} label="Incorrect" />
        <Stat value={`${pct(correct, answered.length)}%`} label="Accuracy" />
        <Stat value={String(hist.length)} label="Completed quizzes" />
        <Stat value={`${best}%`} label="Best score" />
      </div>
      <ProgressBar value={pct(answered.length, PL.length)} />

      <h2 className="mb-2 mt-6 font-[family-name:var(--font-barlow)] text-2xl font-semibold">Quick practice</h2>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap [&>button]:w-full sm:[&>button]:w-auto">
        <button type="button" className="btn" onClick={() => start({ label: "All questions" })}>
          All questions
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => start({ shuffle: true, count: 20, label: "Random practice" })}
        >
          Random 20
        </button>
        {(["easy", "medium", "hard"] as const).map((d) => (
          <button
            key={d}
            type="button"
            className="btn o"
            onClick={() => start({ difficulty: d, shuffle: true, count: 30, label: `${d} practice` })}
          >
            {d[0].toUpperCase() + d.slice(1)}
          </button>
        ))}
        <button
          type="button"
          className="btn o"
          disabled={!inc}
          onClick={() => start({ pool: "incorrect", label: "Incorrect questions" })}
        >
          Incorrect ({inc})
        </button>
        <button
          type="button"
          className="btn o"
          disabled={!un}
          onClick={() => start({ pool: "unanswered", shuffle: true, count: 50, label: "Unanswered" })}
        >
          Unanswered ({un})
        </button>
      </div>

      <h2 className="mb-2 mt-6 font-[family-name:var(--font-barlow)] text-2xl font-semibold">Custom practice</h2>
      <div className="card grid grid-cols-1 gap-3 rounded-[10px] border border-[var(--ln)] bg-[var(--pn)] p-4 sm:flex sm:flex-wrap sm:items-end sm:gap-2">
        <label className="min-w-0 flex-1 sm:flex-none">
          Section
          <br />
          <select
            className="field field-inline mt-1 rounded-lg border border-[var(--ln)] bg-[var(--pn)] px-2.5 py-2"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="">All</option>
            {SECS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0 flex-1 sm:flex-none">
          Difficulty
          <br />
          <select
            className="field field-inline mt-1 rounded-lg border border-[var(--ln)] bg-[var(--pn)] px-2.5 py-2"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">All</option>
            <option>easy</option>
            <option>medium</option>
            <option>hard</option>
          </select>
        </label>
        <label className="min-w-0 flex-1 sm:flex-none">
          Questions
          <br />
          <select
            className="field field-inline mt-1 rounded-lg border border-[var(--ln)] bg-[var(--pn)] px-2.5 py-2"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          >
            {[10, 20, 30, 50, 100].map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
            <option value="0">All</option>
            <option value="x">Custom…</option>
          </select>
        </label>
        <label className="min-w-0 flex-1 sm:flex-none">
          Timer
          <br />
          <select
            className="field field-inline mt-1 rounded-lg border border-[var(--ln)] bg-[var(--pn)] px-2.5 py-2"
            value={timer}
            onChange={(e) => setTimer(e.target.value)}
          >
            <option value="0">None</option>
            <option value="30">30</option>
            <option value="45">45</option>
            <option value="60">60</option>
            <option value="x">Custom…</option>
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2">
          <input type="checkbox" checked={shuffleOn} onChange={(e) => setShuffleOn(e.target.checked)} />
          Shuffle
        </label>
        <button type="button" className="btn ac w-full sm:w-auto" onClick={customStart}>
          Start
        </button>
      </div>

      <h2 className="mb-2 mt-6 font-[family-name:var(--font-barlow)] text-2xl font-semibold">Sections</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
        {SECS.map((s) => {
          const qs = PL.filter((q) => q.section === s);
          const as = qs.map((q) => prog.answers[q.id]).filter(Boolean);
          const cc = as.filter((a) => a!.isCorrect).length;
          return (
            <div key={s} className="card rounded-[10px] border border-[var(--ln)] bg-[var(--pn)] p-4">
              <h3 className="font-[family-name:var(--font-barlow)] text-[21px] font-semibold">{s}</h3>
              <p className="text-[13px] text-[var(--mut)]">
                {qs.length} questions · {as.length} answered · {pct(cc, as.length)}% accuracy
              </p>
              <ProgressBar value={pct(as.length, qs.length)} />
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button type="button" className="btn o" onClick={() => start({ section: s, label: s })}>
                  Start
                </button>
                <button
                  type="button"
                  className="btn o"
                  onClick={() => start({ section: s, shuffle: true, label: `${s} (random)` })}
                >
                  Shuffle
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
