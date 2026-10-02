"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQuiz } from "@/components/QuizProvider";
import { Chip, Flags, OptionList, ProgressBar } from "@/components/ui";
import { pct } from "@/lib/helpers";

export default function QuizPage() {
  const { sess, BY, answer, go, finish, timerLabel } = useQuiz();

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (!sess || sess.completed || /INPUT|SELECT|TEXTAREA/.test((ev.target as HTMLElement).tagName))
        return;
      const k = ev.key.toLowerCase();
      if (k === "arrowright") go(sess.currentQuestionIndex + 1);
      else if (k === "arrowleft") go(sess.currentQuestionIndex - 1);
      else if ("abcdef".includes(k) && k.length === 1) {
        const q = BY[sess.questionIds[sess.currentQuestionIndex]];
        if (q.options.some((o) => o.id === k)) answer(k);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [BY, answer, go, sess]);

  if (!sess || sess.completed)
    return (
      <p>
        No active quiz.{" "}
        <Link href="/" className="btn inline-block">
          Dashboard
        </Link>
      </p>
    );

  const i = sess.currentQuestionIndex;
  const n = sess.questionIds.length;
  const q = BY[sess.questionIds[i]];
  const a = sess.answers[q.id];
  const d = Object.keys(sess.answers).length;

  const tryFinish = () => {
    const u = n - d;
    if (!u || confirm(`${u} question(s) unanswered. Finish quiz?`)) finish();
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Chip>{q.section}</Chip>
        <span className="font-mono" aria-live="off">
          {timerLabel}
        </span>
      </div>
      <p className="mb-1 mt-2.5 font-mono text-[13px] text-[var(--mut)]">
        Question {i + 1} / {n} · {d} answered
      </p>
      <ProgressBar value={pct(d, n)} />
      <div className="my-2.5 flex flex-wrap gap-0.5" aria-label="Question navigator">
        {sess.questionIds.map((id, k) => {
          const x = sess.answers[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => go(k)}
              className={`h-3.5 w-3.5 rounded-sm border border-[var(--ln)] p-0 ${x ? (x.isCorrect ? "bg-[var(--ok)]" : "bg-[var(--no)]") : ""} ${k === i ? "outline outline-2 outline-[var(--ac)]" : ""}`}
              aria-label={`Question ${k + 1}: ${x ? (x.isCorrect ? "correct" : "incorrect") : "unanswered"}`}
            />
          );
        })}
      </div>
      <div className="card rounded-[10px] border border-[var(--ln)] bg-[var(--pn)] p-4">
        <div className="my-3.5 font-[family-name:var(--font-barlow)] text-[25px] font-semibold leading-tight max-[560px]:text-[21px]">
          {q.question}
        </div>
        <OptionList q={q} selected={a?.selectedAnswerId} locked={!!a} onSelect={answer} />
        {a ? (
          <p className="text-[13px] text-[var(--mut)]">
            {a.isCorrect
              ? "Correct."
              : `Incorrect — the correct answer is ${q.correctAnswerId.toUpperCase()}.`}{" "}
            Source: {q.sourcePdf.replace(/_TEST_2\.pdf/, "")} #{q.originalQuestionNumber}
          </p>
        ) : (
          <p className="text-[13px] text-[var(--mut)]">Unanswered — you can skip and come back.</p>
        )}
        <Flags q={q} />
      </div>
      <div className="nav2 sticky bottom-0 z-[5] grid grid-cols-3 gap-2 bg-[var(--bg)] py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] max-sm:[&_.btn]:px-2 max-sm:[&_.btn]:text-sm">
        <button type="button" className="btn o" disabled={!i} onClick={() => go(i - 1)}>
          ← Prev
        </button>
        <button type="button" className="btn ac" onClick={tryFinish}>
          Finish
        </button>
        <button type="button" className="btn o" disabled={i >= n - 1} onClick={() => go(i + 1)}>
          Next →
        </button>
      </div>
    </>
  );
}
