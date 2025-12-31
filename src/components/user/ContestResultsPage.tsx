import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Trophy, AlertCircle, Clock, X } from "lucide-react";
import { ContestDetailsSkeleton } from "@/utils/SkeletonLoader";
import { Tooltip } from "react-tooltip";
import { FaMedal } from "react-icons/fa";
import { Contest, LeaderboardEntry } from "@/types/ContestResultsTypes";
import { getContestResults } from "@/services/contestService";



const ContestResultsPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showProblems, setShowProblems] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    if (!contestId) {
      setError("Invalid contest ID");
      setLoading(false);
      return;
    }

    const loadResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const contestData = await getContestResults(contestId);
        if (!contestData) {
          throw new Error("Contest results not found");
        }
        setContest(contestData);
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err.message ||
          "Failed to load contest results. Please try again later.";
        setError(errorMsg);
        console.error("Error fetching contest results:", err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [contestId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDifficultyMultiplier = (difficulty: string): number => {
    switch (difficulty.toUpperCase()) {
      case "EASY": return 1;
      case "MEDIUM": return 2;
      case "HARD": return 3;
      default: return 1;
    }
  };

  const leaderboard: LeaderboardEntry[] = useMemo(() => {
    if (!contest) return [];
    return contest.participants
      .map((participant) => {
        let problemsSolved = 0;
        let score = 0;
        let totalExecutionTime = 0;
        const solvedProblems: { [problemId: string]: number } = {};

        contest.problems.forEach((problem) => {
          const submissions = contest.latestSubmissions[problem._id] || [];
          const submission = submissions.find((sub) => sub.userId === participant._id);

          if (submission) {
            problemsSolved++;
            const difficultyMultiplier = getDifficultyMultiplier(problem.difficulty);
            score += 100 * difficultyMultiplier;
            totalExecutionTime += submission.executionTime;
            solvedProblems[problem._id] = submission.executionTime;
          }
        });

        return {
          ...participant,
          problemsSolved,
          score,
          totalExecutionTime,
          solvedProblems,
        };
      })
      .filter((participant) => participant.problemsSolved > 0) 
      .sort((a, b) => {
        if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
        if (b.score !== a.score) return b.score - a.score;
        return a.totalExecutionTime - b.totalExecutionTime;
      })
      .slice(0, 5); // Top 5
  }, [contest]);

  const handleRowClick = (participant: LeaderboardEntry) => {
    if (showDetails) {
      setSelectedParticipant(participant);
    }
  };

  const closeModal = () => {
    setSelectedParticipant(null);
  };

  if (loading) {
    return <ContestDetailsSkeleton />;
  }

  if (error || !contest) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center h-screen">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-lg flex items-center shadow-lg">
          <AlertCircle className="w-8 h-8 mr-4" />
          <div>
            <h3 className="text-lg font-semibold mb-1">Error</h3>
            <p>{error || "Contest not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
          {contest.title} - Results
        </h1>
        <Link
          to={`/user/contests/${contest._id}`}
          className="text-blue-500 hover:text-blue-600 font-medium flex items-center"
        >
          <span className="mr-1">←</span> Back to Contest
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl shadow-lg p-6 sticky top-6 border">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contest Details</h2>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
              <p className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                <span><strong>Start:</strong> {formatDate(contest.startTime)}</span>
              </p>
              <p className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                <span><strong>End:</strong> {formatDate(contest.endTime)}</span>
              </p>
              <p><strong>Problems:</strong> {contest.problems.length}</p>
              <p><strong>Participants:</strong> {contest.participants.length}</p>
            </div>
            <hr className="my-4 border" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Scoring Rules</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
              <li>EASY: 100 points</li>
              <li>MEDIUM: 200 points</li>
              <li>HARD: 300 points</li>
              <li>Tiebreaker: Total execution time</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card rounded-xl shadow-lg p-6 border">
            <button
              onClick={() => setShowProblems(!showProblems)}
              className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-white mb-4"
            >
              <span className="flex items-center">
                Problems ({contest.problems.length})
              </span>
              <span>{showProblems ? "▲" : "▼"}</span>
            </button>
            {showProblems && (
              <div className="max-h-96 overflow-y-auto">
                {contest.problems.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No problems available.</p>
                ) : (
                  <ul className="space-y-3">
                    {contest.problems.map((problem) => (
                      <li
                        key={problem._id}
                        className="p-3 bg-gray-700/30 rounded-lg flex justify-between items-center hover:bg-gray-800/20 dark:hover:bg-gray-800/20 transition"
                        data-tooltip-id="difficulty-tooltip"
                        data-tooltip-content={`Difficulty: ${problem.difficulty}`}
                      >
                        <Link
                          to={`/user/problems/${problem.slug}`}
                          className="text-blue-500 hover:text-blue-600 font-medium"
                        >
                          {problem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <Tooltip id="difficulty-tooltip" />
          </div>

          <div className="bg-card rounded-xl shadow-lg p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Top 5 Leaderboard
              </h2>
              {contest.problems.length > 0 && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              )}
            </div>

            {leaderboard.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No participants have solved any problems.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                    <tr>
                      <th className="px-6 py-3">Rank</th>
                      <th className="px-6 py-3">Participant</th>
                      <th className="px-6 py-3">Solved</th>
                      <th className="px-6 py-3">Score</th>
                      {showDetails && <th className="px-6 py-3">Total Time</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((participant, index) => (
                      <tr
                        key={participant._id}
                        className={`border-b dark:border-gray-700 ${
                          index < 3 ? "bg-card" : "bg-white dark:bg-gray-800"
                        } hover:bg-gray-50 dark:hover:bg-gray-700/20 transition ${
                          showDetails ? "cursor-pointer" : ""
                        }`}
                        onClick={() => handleRowClick(participant)}
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            {index === 0 && <FaMedal className="w-4 h-4 mr-1 text-yellow-500" />}
                            {index === 1 && <FaMedal className="w-4 h-4 mr-1 text-gray-400" />}
                            {index === 2 && <FaMedal className="w-4 h-4 mr-1 text-orange-400" />}
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {participant.userName}
                        </td>
                        <td className="px-6 py-4">{participant.problemsSolved}</td>
                        <td className="px-6 py-4">{participant.score}</td>
                        {showDetails && (
                          <td className="px-6 py-4">
                            {participant.totalExecutionTime > 0
                              ? `${participant.totalExecutionTime} ms`
                              : "N/A"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedParticipant.userName}'s Problem Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              {contest.problems.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No problems available.</p>
              ) : (
                <ul className="space-y-3">
                  {contest.problems.map((problem) => (
                    <li
                      key={problem._id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
                      data-tooltip-id="difficulty-tooltip-modal"
                      data-tooltip-content={`Difficulty: ${problem.difficulty}`}
                    >
                      <Link
                        to={`/user/problems/${problem.slug}`}
                        className="text-blue-500 hover:text-blue-600 font-medium"
                      >
                        {problem.title}
                      </Link>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            problem.difficulty === "EASY"
                              ? "bg-green-100 text-green-800"
                              : problem.difficulty === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedParticipant.solvedProblems[problem._id] !== undefined
                            ? `${selectedParticipant.solvedProblems[problem._id]} ms`
                            : "N/A"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Tooltip id="difficulty-tooltip-modal" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestResultsPage;