"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuiz } from "@/components/QuizProvider";
import { Chip, OptionList } from "@/components/ui";
import type { HistoryEntry } from "@/lib/types";

function reviewList(r: HistoryEntry, f: string, BY: Record<string, import("@/lib/types").Question>) {
  return r.questionIds
    .filter((id) => {
      const a = r.answers[id];
      const s = !a ? "u" : a.isCorrect ? "c" : "i";
      return f === "all" || f === s;
    })
    .map((id) => {
      const q = BY[id];
      const a = r.answers[id];
      return (
        <div key={id} className="card my-2.5 rounded-[10px] border border-[var(--ln)] bg-[var(--pn)] p-4">
          <Chip>{q.section}</Chip> <Chip>{q.difficulty}</Chip>{" "}
          <b>{!a ? "○ Unanswered" : a.isCorrect ? "✓ Correct" : "✗ Incorrect"}</b>
          <div className="my-2 font-semibold">{q.question}</div>
          <OptionList q={q} selected={a?.selectedAnswerId} locked />
        </div>
      );
    });
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { hist, BY } = useQuiz();
  const [filter, setFilter] = useState("all");
  const r = hist.find((x) => x.id === id);

  const list = useMemo(
    () => (r ? reviewList(r, filter, BY) : []),
    [BY, filter, r],
  );

  if (!r) return <p>Not found.</p>;

  return (
    <>
      <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-semibold">
        Review · {r.label}
      </h1>
      <label className="flex flex-wrap items-center gap-2">
        Show{" "}
        <select
          className="field field-inline rounded-lg border border-[var(--ln)] bg-[var(--pn)] px-2.5 py-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="c">Correct</option>
          <option value="i">Incorrect</option>
          <option value="u">Unanswered</option>
        </select>
      </label>
      {list.length ? list : <p className="text-[var(--mut)]">Nothing to show.</p>}
    </>
  );
}
