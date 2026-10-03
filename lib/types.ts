export type Option = { id: string; text: string };

export type Question = {
  id: string;
  question: string;
  options: Option[];
  correctAnswerId: string | null;
  section: string;
  category: string;
  difficulty: string;
  sourcePdf: string;
  originalQuestionNumber: string;
  needsReview: string[];
  playable: boolean;
};

export type AnswerState = {
  questionId: string;
  selectedAnswerId: string;
  isCorrect: boolean;
  answeredAt: string;
};

export type QuizSession = {
  id: string;
  mode: string;
  label: string;
  section: string;
  difficulty: string;
  questionIds: string[];
  currentQuestionIndex: number;
  answers: Record<string, AnswerState>;
  startedAt: string;
  lastUpdatedAt: string;
  completed: boolean;
  elapsed: number;
  endAt: number;
};

export type HistoryEntry = QuizSession & {
  completedAt: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  scorePercentage: number;
  timeSec: number;
  timed: boolean;
};

export type StartOptions = {
  section?: string;
  difficulty?: string;
  shuffle?: boolean | number;
  count?: number;
  pool?: "incorrect" | "unanswered";
  timer?: number;
  label?: string;
};

export type Settings = { theme: "auto" | "light" | "dark" };

export type Progress = { answers: Record<string, AnswerState> };
