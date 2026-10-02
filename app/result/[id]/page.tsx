"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuiz } from "@/components/QuizProvider";
import { Stat } from "@/components/ui";
import { fmt, pct } from "@/lib/helpers";

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const { hist, start } = useQuiz();
  const r = hist.find((x) => x.id === id);

  if (!r) return <p>Result not found.</p>;

  const t = r.totalQuestions;
  const f = (k: "correctAnswers" | "incorrectAnswers" | "unansweredQuestions") =>
    pct(r[k], t);

  return (
    <div className="card rounded-[10px] border border-[var(--ln)] bg-[var(--pn)] p-4 text-center">
      <h2 className="font-[family-name:var(--font-barlow)] text-2xl font-semibold">QUIZ COMPLETE</h2>
      <div className="font-[family-name:var(--font-barlow)] text-[clamp(3rem,18vw,5.25rem)] font-semibold leading-none text-[var(--ac)]">
        {r.scorePercentage}%
      </div>
      <p className="font-mono">
        {r.correctAnswers} / {t} correct
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3 text-left">
        <Stat value={`${r.correctAnswers} (${f("correctAnswers")}%)`} label="Correct" />
        <Stat value={`${r.incorrectAnswers} (${f("incorrectAnswers")}%)`} label="Incorrect" />
        <Stat value={`${r.unansweredQuestions} (${f("unansweredQuestions")}%)`} label="Unanswered" />
        <Stat value={r.timed || r.timeSec ? fmt(r.timeSec) : "—"} label="Time" />
      </div>
      <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center [&_.btn]:w-full sm:[&_.btn]:w-auto">
        <Link href={`/review/${r.id}`} className="btn inline-block">
          Review answers
        </Link>
        <button
          type="button"
          className="btn o"
          onClick={() =>
            start({
              section: r.section,
              difficulty: r.difficulty,
              shuffle: r.mode !== "all",
              count: r.totalQuestions,
              label: r.label,
            })
          }
        >
          Try again
        </button>
        <Link href="/" className="btn o inline-block">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
