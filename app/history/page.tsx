"use client";

import Link from "next/link";
import { useQuiz } from "@/components/QuizProvider";

export default function HistoryPage() {
  const { hist } = useQuiz();

  return (
    <>
      <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-semibold">Quiz history</h1>
      {hist.length ? (
        hist.map((r) => (
          <div
            key={r.id}
            className="card my-2.5 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[var(--ln)] bg-[var(--pn)] p-4"
          >
            <div>
              <b>
                {new Date(r.completedAt).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </b>{" "}
              · {r.label}
              <br />
              <span className="text-[13px] text-[var(--mut)]">
                {r.totalQuestions} questions · Score: {r.scorePercentage}%
              </span>
            </div>
            <Link href={`/review/${r.id}`} className="btn o inline-block w-full text-center sm:w-auto">
              Review
            </Link>
          </div>
        ))
      ) : (
        <p className="text-[var(--mut)]">No completed quizzes yet.</p>
      )}
    </>
  );
}
