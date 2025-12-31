import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Search, Plus, X } from "lucide-react";
import toast from "react-hot-toast";


import Table from "@/components/layout/Table";
import Pagination from "@/components/layout/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { TableSkeleton } from "@/utils/SkeletonLoader";
import { getSocket } from "@/utils/socket";
import { IProblem } from "@/types/ProblemTypes";
import { Column } from "@/types/ComponentsTypes";
import { getAdminProblems } from "@/services/adminProblemService";
import { useNavigate } from "react-router-dom";

const ProcessProblemModal = lazy(() => import("./ProcessProblemModal"));

const ProblemsList: React.FC = () => {
  const [problems, setProblems] = useState<IProblem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [newProblems, setNewProblems] = useState<string[]>(() => {
    const saved = localStorage.getItem("newProblems");
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate()

  const itemsPerPage = 10;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const refreshProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminProblems(currentPage, itemsPerPage, debouncedSearchQuery);
      setProblems(data.problems);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      const msg = err.message || "Failed to refresh problems";
      setError(msg);
      toast.error(msg);
      console.error("Refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProblems();
  }, [currentPage, debouncedSearchQuery]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.warn("Socket not initialized in Admin ProblemsList");
      return;
    }

    socket.on("newProblem", (notification: { slug: string; message: string }) => {
      console.log("Admin ProblemsList received newProblem:", notification);
      setNewProblems((prev) => {
        if (prev.includes(notification.slug)) return prev;
        const updated = [...new Set([...prev, notification.slug])];
        localStorage.setItem("newProblems", JSON.stringify(updated));
        toast.success(notification.message, {
          id: `new-problem-${notification.slug}`,
          duration: Infinity,
        });
        return updated;
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Admin ProblemsList Socket.IO connect error:", err.message);
      toast.error("Failed to connect to notification service");
    });

    return () => {
      socket.off("newProblem");
      socket.off("connect_error");
    };
  }, []);

  const handleRowClick = (problem: IProblem) => {
    navigate(`/admin/problems/${problem._id}`);
  };

  const getDifficultyColor = (difficulty: "EASY" | "MEDIUM" | "HARD") => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HARD":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns: Column<IProblem>[] = [
    { key: "slug", header: "Slug", className: "max-w-[200px] truncate" },
    { key: "_id", header: "ID", className: "max-w-[100px] truncate" },
    { key: "title", header: "Title" },
    {
      key: "difficulty",
      header: "Difficulty",
      render: (problem: IProblem) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
            problem.difficulty
          )}`}
        >
          {problem.difficulty}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated At",
      render: (problem: IProblem) =>
        new Date(problem.updatedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
    },
    {
      key: "status",
      header: "Access",
      render: (problem: IProblem) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            problem.status === "premium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {problem.status.charAt(0).toUpperCase() + problem.status.slice(1)}
        </span>
      ),
    },
    {
      key: "isBlocked",
      header: "Status",
      render: (problem: IProblem) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            problem.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}
        >
          {problem.isBlocked ? "Blocked" : "Active"}
        </span>
      ),
    },
  ];

  const handleProblemProcessed = (slug: string) => {
    setNewProblems((prev) => {
      const updated = prev.filter((s) => s !== slug);
      localStorage.setItem("newProblems", JSON.stringify(updated));
      toast.dismiss(`new-problem-${slug}`);
      return updated;
    });
  };

  if (loading && !problems.length) return <TableSkeleton />;

  if (error) return <div className="text-red-500 text-center py-4" role="alert">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-9 min-h-screen flex flex-col">
      {/* Header + Search + Process Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-primary">Problems List</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title or slug..."
              className="w-full pl-10 pr-10 py-2 text-sm rounded-lg border bg-background border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              aria-label="Search problems"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
              aria-hidden="true"
            />
            {loading ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                </svg>
              </div>
            ) : (
              searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setIsProcessModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-accent text-accent-foreground px-3 py-2 text-sm rounded-lg hover:bg-opacity-90 transition-colors w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Process new problem"
          >
            <Plus className="w-4 h-4" />
            <span>Process New Problem</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1">
        <Table
          data={problems}
          columns={columns}
          onRowClick={handleRowClick}
          emptyMessage="No problems found"
          aria-label="Admin problems table"
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            aria-label="Admin problems pagination"
          />
        </div>
      )}

      {/* Process New Problem Modal */}
      <Suspense fallback={<div aria-live="polite">Loading Process Modal...</div>}>
        <ProcessProblemModal
          isOpen={isProcessModalOpen}
          onClose={() => setIsProcessModalOpen(false)}
          onSuccess={async (slug) => {
            // Refresh the list after new problem is processed
            await refreshProblems();
            handleProblemProcessed(slug);
          }}
          newProblems={newProblems}
        />
      </Suspense>
    </div>
  );
};

export default ProblemsList;