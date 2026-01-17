"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (params?.token) {
      setToken(params.token);
    }
  }, [params]);

  const handleAccept = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/team/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to accept invitation");
        return;
      }

      setSuccess(true);
      setInviteData(data.data);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/dashboard/manufacturer");
      }, 3000);
    } catch (err) {
      console.error("Error accepting invite:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
          <p className="text-gray-600 mb-4">
            You have successfully joined the team at{" "}
            <strong>{inviteData?.manufacturer?.name}</strong>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              Your role: <strong>{inviteData?.role}</strong>
            </p>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Redirecting you to your dashboard in 3 seconds...
          </p>
          <Link
            href="/dashboard/manufacturer"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Team</h1>
          <p className="text-gray-600">Accept your invitation to join Lumora</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleAccept} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Accepting..." : "Accept Invitation"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          If you didn't expect this invitation,{" "}
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
