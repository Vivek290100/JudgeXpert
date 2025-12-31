import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { verifyCurrentSubscription } from "@/services/successPageTypes";


const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get("session_id");

    if (!sessionId) {
      setError("Invalid session ID. Please try again or contact support.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const subscription = await verifyCurrentSubscription();

        if (subscription?.status === "active") {
          toast.success("Subscription activated successfully! Welcome to premium!", {
            duration: 5000,
          });
        } else {
          throw new Error("Subscription is not active yet. Please wait a moment.");
        }
      } catch (err: any) {
        const msg = err.message || "Failed to verify subscription";
        setError(msg);
        toast.error(msg);
        console.error("Subscription verification error:", err);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [location.search]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 min-h-screen flex flex-col justify-center items-center">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
        </svg>
        <p className="mt-4 text-lg">Verifying your subscription...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 min-h-screen flex flex-col justify-center items-center text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Oops!</h1>
        <p className="text-lg mb-6">{error}</p>
        <button
          onClick={() => navigate("/user/subscription")}
          className="bg-primary text-primary-foreground py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Subscription
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 min-h-screen flex flex-col justify-center items-center text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold text-green-500 mb-6">Success! 🎉</h1>
        <p className="text-xl mb-8">
          Your subscription has been activated successfully.
          <br />
          Enjoy full access to premium features!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/user/subscription")}
            className="bg-primary text-primary-foreground py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            View Subscription
          </button>
          <button
            onClick={() => navigate("/user/dashboard")}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-8 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;