export interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export interface Participant {
  _id: string;
  userName: string;
}

export interface Submission {
  userId: string;
  userName: string;
  executionTime: number;
  submittedAt: string;
}

export interface Contest {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  problems: Problem[];
  participants: Participant[];
  latestSubmissions: { [problemId: string]: Submission[] };
}

export interface LeaderboardEntry extends Participant {
  problemsSolved: number;
  score: number;
  totalExecutionTime: number;
  solvedProblems: { [problemId: string]: number };
}