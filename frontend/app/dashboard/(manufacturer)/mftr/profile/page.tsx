"use client";
import React, { useState } from "react";
import {
  User,
  FileCheck,
  Upload,
  Info,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import Sidebar from "@/components/Dashboard/Sidebar";
import { useRouter } from "next/navigation";

// Define allowed status values
type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export default function ProfilePage() {
  const router = useRouter();
  const [nameChangeCount, setNameChangeCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Explicitly type the profile state
  const [profile, setProfile] = useState<{
    businessName: string;
    email: string;
    nafdacNo: string;
    verificationStatus: VerificationStatus;
  }>({
    businessName: "NatureCare Ltd",
    email: "contact@naturecare.com",
    nafdacNo: "03-8821",
    verificationStatus: "PENDING",
  });

  const [aiResult, setAiResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (e: any) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiResult({
        score: 0.94,
        status: "CLEAN",
        reasons: [
          "Watermarks verified",
          "OCR matches NAFDAC database",
          "No ELA anomalies",
        ],
      });
    }, 3000);
  };

  const accountStatus: VerificationStatus = profile.verificationStatus;

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar status={accountStatus} />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-8">
        {/* Mobile Back Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-green-500 font-bold"
          >
            <ArrowLeft size={20} /> Back
          </button>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Manufacturer Profile</h1>
          <p className="text-gray-400">
            Manage your identity and verify your manufacturing license.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: General Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-8">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <User className="text-green-500" size={20} /> Identity Details
                </h3>
                {nameChangeCount < 1 && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm text-green-500 hover:underline"
                  >
                    {isEditing ? "Cancel" : "Edit Name"}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Business Name
                  </label>
                  <input
                    disabled={!isEditing || nameChangeCount >= 1}
                    value={profile.businessName}
                    className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl mt-1 text-white disabled:opacity-50"
                    onChange={(e) =>
                      setProfile({ ...profile, businessName: e.target.value })
                    }
                  />
                  {nameChangeCount >= 1 && (
                    <p className="text-[10px] text-amber-500 mt-2 flex items-center gap-1">
                      <Info size={12} /> Legal name locked. Contact support for
                      further changes.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Email Address
                  </label>
                  <input
                    disabled
                    value={profile.email}
                    className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl mt-1 text-gray-400"
                  />
                </div>

                {isEditing && (
                  <button
                    onClick={() => {
                      setNameChangeCount(1);
                      setIsEditing(false);
                    }}
                    className="bg-green-600 px-6 py-3 rounded-xl font-bold text-sm mt-2"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Verification Status */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-8 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="text-green-500" size={32} />
              </div>
              <h3 className="text-lg font-bold">Verification Status</h3>
              <div
                className={`mt-2 inline-block px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  profile.verificationStatus === "VERIFIED"
                    ? "bg-green-500/20 text-green-500"
                    : "bg-amber-500/20 text-amber-500"
                }`}
              >
                {profile.verificationStatus}
              </div>
              <p className="text-gray-500 text-xs mt-4 leading-relaxed">
                Your account must be verified by an admin before you can
                generate live codes.
              </p>
            </div>
          </div>
        </div>

        {/* AI Certificate Upload */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-white/10">
            <h3 className="text-xl font-bold">
              License Verification (AI Scan)
            </h3>
            <p className="text-gray-400 text-sm">
              Upload your NAFDAC or Manufacturing License for AI integrity
              analysis.
            </p>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            {/* Upload Box */}
            <div
              className={`border-2 border-dashed rounded-[2rem] p-8 md:p-12 text-center transition cursor-pointer relative ${
                profile.verificationStatus === "VERIFIED"
                  ? "border-gray-700 opacity-50 cursor-not-allowed"
                  : "border-white/10 hover:border-green-500/50"
              }`}
            >
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={profile.verificationStatus === "VERIFIED"}
              />
              <Upload
                className={`mx-auto mb-4 text-gray-500 ${
                  profile.verificationStatus === "VERIFIED"
                    ? "text-gray-400"
                    : ""
                }`}
                size={40}
              />
              <p
                className={`text-white font-medium ${
                  profile.verificationStatus === "VERIFIED"
                    ? "text-gray-400"
                    : ""
                }`}
              >
                {profile.verificationStatus === "VERIFIED"
                  ? "Document verified ✅"
                  : "Click to upload document"}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                PDF, PNG, or JPG (Max 10MB)
              </p>
            </div>

            {/* AI Analysis Display */}
            <div className="bg-black/40 rounded-[2rem] p-6 md:p-8 flex flex-col justify-center">
              {isAnalyzing ? (
                <div className="text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-green-500 font-mono text-[12px] uppercase animate-pulse">
                    AI is analyzing document integrity...
                  </p>
                </div>
              ) : aiResult ? (
                <div className="animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase">
                      AI Analysis Report
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                        aiResult.status === "CLEAN"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {aiResult.status}
                    </span>
                  </div>
                  <div className="text-4xl font-bold mb-4">
                    {(aiResult.score * 100).toFixed(0)}%
                    <span className="text-sm font-normal text-gray-500">
                      {" "}
                      Trust Score
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {aiResult.reasons.map((r: string, i: number) => (
                      <li
                        key={i}
                        className="text-xs text-gray-400 flex items-center gap-2"
                      >
                        <CheckCircle2 size={12} className="text-green-500" />{" "}
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  <Info className="mx-auto mb-2" />
                  <p className="text-sm">
                    Analysis results will appear here after upload.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
