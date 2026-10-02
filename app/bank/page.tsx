"use client";

import { useMemo, useState } from "react";
import { useQuiz } from "@/components/QuizProvider";
import { Chip, Flags, OptionList } from "@/components/ui";

export default function BankPage() {
  const { Q, SECS, prog } = useQuiz();
  const [search, setSearch] = useState("");
  const [sec, setSec] = useState("");
  const [diff, setDiff] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return Q.filter((q) => {
      const a = prog.answers[q.id];
      if (
        t &&
        !(q.question + " " + q.section + " " + q.options.map((o) => o.text).join(" "))
          .toLowerCase()
          .includes(t)
      )
        return false;
      if (sec && q.section !== sec) return false;
      if (diff && q.difficulty !== diff) return false;
      if (status === "answered" && !a) return false;
      if (status === "unanswered" && a) return false;
      if (status === "correct" && !(a && a.isCorrect)) return false;
      if (status === "incorrect" && !(a && !a.isCorrect)) return false;
      if (status === "review" && !q.needsReview.length) return false;
      return true;
    });
  }, [Q, diff, prog.answers, search, sec, status]);

  const shown = filtered.slice(0, page * 50);

  const resetFilters = () => setPage(1);

  return (
    <>
      <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-semibold">Question bank</h1>
      <p className="text-[var(--mut)]">{Q.length} questions</p>
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        <input
          type="search"
          placeholder="Search questions, sections…"
          aria-label="Search"
          className="field min-w-0 rounded-lg border border-[var(--ln)] bg-[var(--pn)] px-2.5 py-2 sm:min-w-[200px] sm:flex-1"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetFilters();
          }}
        />
        <select
          aria-label="Section"
          className="field field-inline rounded-lg border border-[var(--ln)] bg-[var(--pn)] px-2.5 py-2"
          value={sec}
          onChange={(e) => {
            setSec(e.target.value);
            resetFilters();
          }}
        >
          <option value="">All sections</option>
          {SECS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          aria-label="Difficulty"
          className="field field-inline rounded-lg border border-[var(--ln)] bg-[var(--pn)] px-2.5 py-2"
          value={diff}
          onChange={(e) => {
            setDiff(e.target.value);
            resetFilters();
          }}
        >
          <option value="">All difficulties</option>
          {["easy", "medium", "hard"].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          aria-label="Status"
          className="field field-inline rounded-lg border border-[var(--ln)] bg-[var(--pn)] px-2.5 py-2"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            resetFilters();
          }}
        >
          {[
            ["", "All status"],
            ["answered", "Answered"],
            ["unanswered", "Unanswered"],
            ["correct", "Correct"],
            ["incorrect", "Incorrect"],
            ["review", "Needs review"],
          ].map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <p className="text-[13px] text-[var(--mut)]">{filtered.length} matching questions</p>
      {shown.map((q) => {
        const a = prog.answers[q.id];
        return (
          <details key={q.id} className="card my-1.5 rounded-[10px] border border-[var(--ln)] bg-[var(--pn)] p-4">
            <summary className="cursor-pointer">
              <b aria-label={!a ? "unanswered" : a.isCorrect ? "correct" : "incorrect"}>
                {!a ? "○" : a.isCorrect ? "✓" : "✗"}
              </b>{" "}
              {q.question.slice(0, 150)}
              <Chip>{q.section}</Chip> <Chip>{q.difficulty}</Chip>
              {q.needsReview.length ? <span className="text-[var(--ac)]"> ⚠</span> : null}
            </summary>
            <OptionList q={q} selected={a?.selectedAnswerId} locked />
            <Flags q={q} />
            <p className="text-[13px] text-[var(--mut)]">
              {q.sourcePdf} #{q.originalQuestionNumber}
            </p>
          </details>
        );
      })}
      {filtered.length > shown.length ? (
        <button type="button" className="btn o" onClick={() => setPage((p) => p + 1)}>
          Show more
        </button>
      ) : null}
    </>
  );
}
