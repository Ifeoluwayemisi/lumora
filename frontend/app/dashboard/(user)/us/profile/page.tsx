"use client";
import React, { useState, useRef } from "react";
import {
  User,
  Camera,
  Shield,
  Lock,
  Mail,
  MapPin,
  CheckCircle,
  ChevronRight,
  Save,
  Trash2,
  KeyRound,
  Fingerprint,
} from "lucide-react";

export default function UserProfile() {
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImgPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 1500); // Simulate API call
  };

  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* --- SECTION 1: IDENTITY HEADER --- */}
      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10">
        <div className="relative group">
          <div className="w-40 h-40 rounded-full border-4 border-green-500/20 p-2 relative overflow-hidden flex items-center justify-center bg-black">
            {imgPreview ? (
              <img
                src={imgPreview}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User size={64} className="text-gray-800" />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 p-3 bg-green-500 text-black rounded-full shadow-lg hover:scale-110 transition active:scale-95"
          >
            <Camera size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                John Doe
              </h1>
              <CheckCircle className="text-blue-500" size={24} />
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">
              Certified Consumer • ID: LUM-882-991
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
              <Shield className="text-green-500" size={14} />
              <span className="text-[10px] font-black uppercase">
                Trust Score: 98%
              </span>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
              <Fingerprint className="text-blue-500" size={14} />
              <span className="text-[10px] font-black uppercase">
                Biometrics Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* --- SECTION 2: PERSONAL DETAILS --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 px-2">
            <User size={18} className="text-gray-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">
              Personal Data
            </h3>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500 font-bold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="j.doe@lumora.security"
                  className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500 font-bold transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-4">
                Current Location
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                  size={16}
                />
                <input
                  type="text"
                  defaultValue="Lagos, Nigeria"
                  className="w-full bg-black border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-green-500 font-bold transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-green-500 transition-all"
            >
              <Save size={16} />{" "}
              {isUpdating ? "Saving Ledger..." : "Update Profile"}
            </button>
          </div>
        </div>

        {/* --- SECTION 3: SECURITY & PREFERENCES --- */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Lock size={18} className="text-gray-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">
              Vault Security
            </h3>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-4">
            <button className="w-full bg-black/40 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition">
              <div className="flex items-center gap-4">
                <KeyRound size={20} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase">
                  Change Password
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-700" />
            </button>

            <button className="w-full bg-black/40 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition text-red-500">
              <div className="flex items-center gap-4">
                <Trash2 size={20} />
                <span className="text-[10px] font-black uppercase">
                  Deactivate Account
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-800" />
            </button>

            <div className="pt-6 mt-6 border-t border-white/5 text-center">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-relaxed">
                Your cryptographic keys are encrypted with AES-256 standard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
