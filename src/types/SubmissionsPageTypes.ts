export interface Submission {
  _id: string;
  language: string;
  passed: boolean;
  testCasesPassed: number;
  totalTestCases: number;
  createdAt: string;
  executionTime: number;
  contestId?: string | null;
  contestTitle?: string | null;
  code: string;
}