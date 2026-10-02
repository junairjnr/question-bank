"use client";

import { useQuiz } from "./QuizProvider";

export function LoadGate({ children }: { children: React.ReactNode }) {
  const { ready } = useQuiz();
  if (!ready)
    return (
      <p className="text-[var(--mut)]" role="status">
        Loading question bank…
      </p>
    );
  return children;
}
