import React, { useState, useEffect } from "react";
import { Trophy, Medal, Award, Activity, Users, AlertCircle } from "lucide-react";
import Table from "@/components/layout/Table";
import Pagination from "@/components/layout/Pagination";
import { useTheme } from "@/contexts/ThemeContext";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Store";
import { TableSkeleton } from "@/utils/SkeletonLoader";

import { getLeaderboard } from "@/services/leaderboardService";
// ───────────────────────────────────────────────────────────────

import { LeaderboardEntry, UserStats } from "@/types/LeaderboardTypes";
import { Column } from "@/types/ComponentsTypes";

const LeaderboardPage: React.FC = () => {
  const { theme } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [userStats, setUserStats] = useState<UserStats>({
    totalProblems: 0,
    solvedProblems: 0,
    solvedByDifficulty: { EASY: 0, MEDIUM: 0, HARD: 0 },
    rank: undefined,
    score: undefined,
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getLeaderboard(currentPage, 10);

        setLeaderboardData(data.leaderboard);
        setTotalPages(data.totalPages);

        const userEntry = data.leaderboard.find((entry) => entry._id === user?.id);
        if (userEntry) {
          setUserStats((prev) => ({
            ...prev,
            rank: userEntry.rank,
            score: userEntry.score,
          }));
        }
      } catch (err: any) {
        setError(err.message || "Failed to load leaderboard");
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentPage, user]);


  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-blue-800">
            <Trophy className="w-4 h-4 text-green-400" />
            <div className="absolute -top-1 -right-3 flex items-center justify-center w-5 h-5 bg-green-400 text-white text-xs font-bold rounded-full">1</div>
          </div>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center justify-center">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-blue-800">
            <Medal className="w-4 h-4 text-yellow-400" />
            <div className="absolute -top-1 -right-3 flex items-center justify-center w-5 h-5 bg-yellow-400 text-white text-xs font-bold rounded-full">2</div>
          </div>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center justify-center">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-blue-800">
            <Medal className="w-4 h-4 text-orange-400" />
            <div className="absolute -top-1 -right-3 flex items-center justify-center w-5 h-5 bg-orange-400 text-white text-xs font-bold rounded-full">3</div>
          </div>
        </div>
      );
    } else if (rank <= 4) {
      return (
        <div className="flex items-center justify-center">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-blue-800">
            <Award className="w-5 h-5 text-blue-300" />
            <div className="absolute -top-1 -right-3 flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full">{rank}</div>
          </div>
        </div>
      );
    }
    return <span className="text-center block w-full">{rank}</span>;
  };

  const columns: Column<LeaderboardEntry>[] = [
    {
      key: "rank",
      header: "Rank",
      className: "w-20",
      render: (item: LeaderboardEntry) => renderRankBadge(item.rank),
    },
    {
      key: "username",
      header: "Username",
      render: (item: LeaderboardEntry) => <span className="font-medium">{item.username}</span>,
    },
    {
      key: "score",
      header: "Score",
      render: (item: LeaderboardEntry) => <span className="text-blue-500">{item.score}</span>,
    },
  ];

  const handleRowClick = (item: LeaderboardEntry) => {
    console.log("Clicked on:", item);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const progressPercentage = Math.round((userStats.solvedProblems / userStats.totalProblems) * 100) || 0;

  if (loading) {
    return <TableSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          {/* User Stats Card */}
          <div className="w-full md:w-64 flex flex-col gap-4">
            <div className="bg-card rounded-lg shadow-md p-4 border border-border">
              <h2 className="text-lg font-bold mb-3 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-blue-500" />
                Your Ranking
              </h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Current Rank</div>
                  <div className="text-2xl font-bold flex items-center">
                    #{userStats.rank || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Score</div>
                  <div className="text-2xl font-bold text-blue-500">
                    {userStats.score || user?.problemsSolved || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Problem Solving Progress */}
            <div className="bg-card rounded-lg shadow-md p-4 border border-border">
              <h2 className="text-lg font-bold mb-3 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Problem Solving
              </h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Completion</span>
                <span className="text-sm font-medium">
                  {userStats.solvedProblems}/{userStats.totalProblems}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="flex flex-col items-center p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <span className="text-xs text-green-800 dark:text-green-300">Easy</span>
                  <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                    {userStats.solvedByDifficulty.EASY}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <span className="text-xs text-yellow-800 dark:text-yellow-300">Medium</span>
                  <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                    {userStats.solvedByDifficulty.MEDIUM}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <span className="text-xs text-red-800 dark:text-red-300">Hard</span>
                  <span className="text-sm font-semibold text-red-800 dark:text-red-300">
                    {userStats.solvedByDifficulty.HARD}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="flex-1">
            <div className="bg-card rounded-lg shadow-md border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  Global Leaderboard
                </h2>
              </div>
              <div className="p-4">
                <Table<LeaderboardEntry>
                  data={leaderboardData}
                  columns={columns}
                  onRowClick={handleRowClick}
                  emptyMessage="No leaderboard data available"
                  rowClassName={theme === "dark" ? "text-white" : "text-gray-900"}
                />
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      maxVisibleButtons={5}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;