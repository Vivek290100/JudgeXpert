import  { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaGithub, FaLinkedin, FaStar, FaChevronRight } from "react-icons/fa";

import { getUserProblemStats } from "@/services/userService";
import { getLeaderboard } from "@/services/leaderboardService";

import { RootState } from "@/redux/Store";
import EditProfile from "./EditProfile";
import { IProblem, IUserProblemStatus } from "@/types/ProblemTypes";
import { LeaderboardEntry } from "@/types/LeaderboardTypes";
import { Difficulty } from "@/types/Enums";

const UserDashboard = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [problems, setProblems] = useState<IProblem[]>([]);
  const [userProblemStatus, setUserProblemStatus] = useState<IUserProblemStatus[]>([]);
  const [totalProblemsInDb, setTotalProblemsInDb] = useState(0);
  const [userRank, setUserRank] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchStats = async () => {
      setLoading(true);

      try {
        const statsData = await getUserProblemStats();
        setProblems(statsData.problems);
        setUserProblemStatus(statsData.userProblemStatus);
        setTotalProblemsInDb(statsData.totalProblemsInDb);

        const lbData = await getLeaderboard(1, 100);
        const userEntry = lbData.leaderboard.find((entry: LeaderboardEntry) => entry._id === user.id);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      } catch (err: any) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user]);

  const solvedProblems = userProblemStatus.filter((status) => status.solved).length;
  const progressPercentage = totalProblemsInDb
    ? ((solvedProblems / totalProblemsInDb) * 100).toFixed(1)
    : "0";

  const solvedByDifficulty = {
    [Difficulty.EASY]: 0,
    [Difficulty.MEDIUM]: 0,
    [Difficulty.HARD]: 0,
  };

  problems.forEach((problem) => {
    if (userProblemStatus.find((s) => s.problemId === problem._id && s.solved)) {
      solvedByDifficulty[problem.difficulty]++;
    }
  });

  const getDifficultyPillColor = (difficulty: string) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return "text-green-300";
      case Difficulty.MEDIUM:
        return "text-yellow-300";
      case Difficulty.HARD:
        return "text-red-300";
      default:
        return "text-gray-400";
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <button
            className="px-8 py-3 bg-yellow-500 text-black text-lg font-medium rounded-lg hover:bg-yellow-600 transition"
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-primary min-h-screen p-4">
      <div className="mx-auto max-w-7xl flex flex-col gap-6 lg:flex-row">
        {/* Profile Card */}
        <div className="flex flex-col gap-6 w-full lg:w-1/4">
          <div className="bg-card p-6 rounded-xl shadow border">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 bg-gray-800 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-400">
                    {user.fullName?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-center">Profile</h2>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <button
              className="w-full p-4 text-left text-gray-300 hover:bg-gray-700 flex items-center justify-between"
              onClick={() => setIsEditProfileOpen(true)}
            >
              Edit Profile
              <FaChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Contest & Other Info */}
        <div className="flex flex-col gap-6 w-full lg:w-2/4">
          <div className="bg-card p-6 rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-1">{user.fullName || "Vivek"}</h2>
            <p className="text-primary mb-4">{user.email}</p>
            <div className="flex gap-6">
              <a
                href={user.github || "#"}
                className="flex items-center gap-2 text-primary hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub />
                <span>{user.github ? "GitHub" : "www.github"}</span>
              </a>
              <a
                href={user.linkedin || "#"}
                className="flex items-center gap-2 text-primary hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin />
                <span>{user.linkedin ? "LinkedIn" : "www.linkedin"}</span>
              </a>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl shadow border">
            <div className="flex items-center mb-4">
              <FaStar className="text-yellow-500 mr-3" />
              <h3 className="text-xl font-semibold">Contests</h3>
            </div>
            <p className="text-primary">Code. Compete. Win! 🏆</p>
            <p className="text-gray-400 mt-2 mb-6">Participate in coding battles!</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="flex-1 bg-gray-800 text-gray-300 px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => navigate("/user/contests/winners")}
              >
                Contest Winners
              </button>
              <button
                className="flex-1 bg-gray-100 text-gray-900 px-4 py-2 rounded hover:bg-gray-200"
                onClick={() => navigate("/user/contests")}
              >
                Participate
              </button>
            </div>
          </div>
        </div>

        {/* Rank & Acceptance */}
        <div className="flex flex-col gap-6 w-full lg:w-1/4">
          <div className="bg-card p-6 rounded-xl shadow border">
            <h3 className="text-xl font-semibold mb-4">My Rank</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-primary">Level Up!</p>
                <p className="text-gray-400 text-sm">Solve more to boost rank.</p>
              </div>
              <div className="bg-yellow-500 w-14 h-14 flex items-center justify-center rounded-full shadow">
                <span className="text-black font-bold text-xl">
                  #{userRank !== undefined ? userRank : "N/A"}
                </span>
              </div>
            </div>
            <button
              className="w-full py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
              onClick={() => navigate("/user/leaderboard")}
            >
              Leaderboard
            </button>
          </div>

          <div className="bg-card p-6 rounded-xl shadow border">
            <h3 className="text-xl font-semibold mb-4">Acceptance</h3>
            {loading ? (
              <p className="text-gray-400">Loading stats...</p>
            ) : (
              <>
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold">
                    {solvedProblems}/{totalProblemsInDb}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-6 mb-4 overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 text-sm font-semibold text-primary flex items-center justify-center transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    {progressPercentage}%
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {Object.entries(solvedByDifficulty).map(([diff, count]) => (
                    <div
                      key={diff}
                      className="flex justify-between bg-gray-800 px-3 py-2 rounded"
                    >
                      <span className={`text-base ${getDifficultyPillColor(diff)}`}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase()}
                      </span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                  onClick={() => navigate("/user/problems")}
                >
                  Solve Problems
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfile isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
    </div>
  );
};

export default UserDashboard;