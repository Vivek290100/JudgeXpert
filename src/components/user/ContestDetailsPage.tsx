import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, Code2, AlertCircle, ListChecks, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import { ContestDetailsSkeleton } from "@/utils/SkeletonLoader";
import { getContestDetail, getMyRegisteredContests } from "@/services/contestService";

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
  slug: string;
}

interface Contest {
  _id: string;
  title: string;
  slug: string;
  description: string;
  startTime: string;
  endTime: string;
  problems: Problem[];
  participants: { _id: string; userName: string }[];
  isActive: boolean;
  isBlocked: boolean;
}

const ContestDetailsPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [contestEnded, setContestEnded] = useState(false);
  const [contestStarted, setContestStarted] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  useEffect(() => {
    if (!contestId) {
      setError("Invalid contest ID");
      setLoading(false);
      return;
    }

    const loadContestData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contestData, registeredIds] = await Promise.all([
          getContestDetail(contestId),
          getMyRegisteredContests(),
        ]);

        if (!contestData) {
          throw new Error("Contest not found");
        }

        setContest(contestData);
        setIsRegistered(registeredIds.includes(contestId));
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load contest details");
        console.error("Error loading contest:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContestData();
  }, [contestId]);

  useEffect(() => {
    if (!contest) return;

    const updateTimer = () => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);

      let targetTime: Date;
      let prefix: string;

      if (now < start) {
        targetTime = start;
        prefix = "Starts in: ";
        setContestStarted(false);
      } else if (now <= end) {
        targetTime = end;
        prefix = "Ends in: ";
        setContestStarted(true);
      } else {
        setTimeLeft("Contest has ended");
        setContestEnded(true);
        setContestStarted(true);
        return;
      }

      const diff = targetTime.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft("Contest has ended");
        setContestEnded(true);
        setContestStarted(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${prefix}${days}d ${hours}h ${minutes}m ${seconds}s`
      );
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [contest]);

  const handleProblemClick = (problem: Problem) => {
    if (!problem.slug || problem.slug === "undefined") {
      console.error("Invalid problem slug:", problem.slug, "for problem:", problem);
      toast.error("Cannot navigate to problem: Invalid problem identifier");
      return;
    }
    navigate(`/user/problems/${problem.slug}`, { state: { contestId: contest?._id } });
  };

  const isProblemAccessRestricted = () => {
    if (contestEnded) return true;
    return !isRegistered || !contestStarted;
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

  const restricted = isProblemAccessRestricted();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">{contest.title}</h1>
        {contestEnded && (
          <Link
            to={`/user/contests/${contest._id}/results`}
            className="flex items-center gap-1 py-1.5 px-3 rounded text-sm text-white bg-blue-500 hover:bg-blue-600"
          >
            <Trophy className="w-4 h-4" />
            Contest Results
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-lg shadow-md p-4 border border-border">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Contest Timer
            </h2>
            <p className="text-xl font-mono text-foreground">{timeLeft}</p>
            <div className="mt-4 text-sm text-gray-400">
              <p>
                <span className="font-medium">Start:</span>{" "}
                {new Date(contest.startTime).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
              <p>
                <span className="font-medium">End:</span>{" "}
                {new Date(contest.endTime).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-md p-4 border border-border">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <ListChecks className="w-5 h-5 mr-2" />
              Rules and Regulations
            </h2>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-2">
              <li>Participants must submit solutions independently.</li>
              <li>Plagiarism or cheating will result in disqualification.</li>
              <li>Submissions must be made before the contest ends.</li>
              <li>Follow the problem constraints and input/output formats.</li>
              <li>Respect the contest schedule and deadlines.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow-md p-4 border border-border mb-6">
            <h2 className="text-lg font-semibold text-primary mb-2">Description</h2>
            <p className="text-sm text-gray-400">{contest.description}</p>
          </div>

          <div className="bg-card rounded-lg shadow-md p-4 border border-border mb-6">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <Code2 className="w-5 h-5 mr-2" />
              Problems
            </h2>

            {!contestStarted ? (
              <p className="text-sm text-yellow-400 italic">
                contest starts soon...
              </p>
            ) : contest.problems.length > 0 ? (
              contest.problems.map((problem) => {
                const disabled = restricted || !problem.slug || problem.slug === "undefined";
                return (
                  <div
                    key={problem._id}
                    className={`flex items-center justify-between p-3 mb-2 rounded-lg ${
                      disabled
                        ? "bg-gray-700/30 cursor-not-allowed"
                        : "bg-gray-800/30 hover:bg-gray-800/50 cursor-pointer"
                    } transition-colors`}
                    onClick={disabled ? undefined : () => handleProblemClick(problem)}
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-foreground">{problem.title}</h3>
                      <p className="text-xs text-gray-400 capitalize">
                        Difficulty: {problem.difficulty}
                      </p>
                    </div>
                    <button
                      className={`text-xs ${
                        disabled ? "text-gray-500" : "text-blue-400 hover:text-blue-300"
                      }`}
                      disabled={disabled}
                    >
                      {contestEnded
                        ? "Contest Ended"
                        : !isRegistered
                        ? "Register to Solve"
                        : "Solve Now"}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 italic">No problems available for this contest.</p>
            )}

            {contestStarted && restricted && (
              <p className="text-sm text-yellow-400 mt-4">
                {!isRegistered
                  ? "You must register for this contest before contest begins to solve the problem. Go back to the contests page to register."
                  : "."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestDetailsPage;