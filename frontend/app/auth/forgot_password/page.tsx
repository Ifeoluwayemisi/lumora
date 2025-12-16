"use client";
import { useState } from "react";
import { Mail, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: BACKEND_NODEJS_CONNECTION: Placeholder for Resend/Nodemailer API call
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[2.5rem]">
        {!submitted ? (
          <>
            <h2 className="text-3xl font-bold text-white mb-2">
              Reset Password
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              Enter your email and we'll send you a recovery link.
            </p>

            <form onSubmit={handleReset} className="space-y-6">
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-green-500 text-white"
                  placeholder="name@company.com"
                />
              </div>

              <button className="w-full bg-green-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-500 transition">
                Send Reset Link <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="text-green-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Check your inbox
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              We've sent a password reset link to <br />
              <span className="text-white font-medium">{email}</span>
            </p>
          </div>
        )}

        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-2 text-gray-500 hover:text-white mt-8 text-sm transition"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
}
