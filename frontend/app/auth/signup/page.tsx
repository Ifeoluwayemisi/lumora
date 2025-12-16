"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpInput } from "../../../libs/validations/auth";
import { useState } from "react";
import { Building2, User, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CONSUMER" | "MANUFACTURER">("CONSUMER");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "CONSUMER" },
  });

  const onSubmit = async (data: SignUpInput) => {
    // Sync role with form data
    data.role = role;

    // Mock backend delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Signup submitted:", data);

    // Redirect after signup
    if (role === "MANUFACTURER") router.push("/onboarding/manufacturer");
    else router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">
          Join Lumora
        </h2>
        <p className="text-gray-400 text-center mb-8">
          Select your account type to continue.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Hidden input for role */}
          <input type="hidden" {...register("role")} value={role} />

          {/* Role Selection Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole("CONSUMER")}
              className={`flex-1 p-4 rounded-2xl border transition flex flex-col items-center gap-2 ${
                role === "CONSUMER"
                  ? "border-green-500 bg-green-500/10"
                  : "border-white/10 bg-white/5 text-gray-500"
              } hover:scale-[1.02]`}
            >
              <User size={24} />{" "}
              <span className="text-xs font-bold uppercase">Consumer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("MANUFACTURER")}
              className={`flex-1 p-4 rounded-2xl border transition flex flex-col items-center gap-2 ${
                role === "MANUFACTURER"
                  ? "border-green-500 bg-green-500/10"
                  : "border-white/10 bg-white/5 text-gray-500"
              } hover:scale-[1.02]`}
            >
              <Building2 size={24} />{" "}
              <span className="text-xs font-bold uppercase">Manufacturer</span>
            </button>
          </div>

          {/* Standard Fields */}
          <div>
            <input
              {...register("email")}
              className={`w-full bg-black/50 border ${
                errors.email ? "border-red-500" : "border-white/10"
              } p-4 rounded-xl outline-none focus:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500 text-white transition`}
              placeholder="Email Address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              {...register("password")}
              className={`w-full bg-black/50 border ${
                errors.password ? "border-red-500" : "border-white/10"
              } p-4 rounded-xl outline-none focus:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500 text-white transition`}
              placeholder="Password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.password.message}
              </p>
            )}
          </div>

          {/* Conditional Manufacturer Fields */}
          {role === "MANUFACTURER" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
              <input
                {...register("companyName")}
                className={`w-full bg-black/50 border ${
                  errors.companyName ? "border-red-500" : "border-white/10"
                } p-4 rounded-xl outline-none focus:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500 text-white transition`}
                placeholder="Registered Company Name"
              />
              {errors.companyName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.companyName.message}
                </p>
              )}

              <input
                {...register("nafdacNumber")}
                className={`w-full bg-black/50 border ${
                  errors.nafdacNumber ? "border-red-500" : "border-white/10"
                } p-4 rounded-xl outline-none focus:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500 text-white transition`}
                placeholder="NAFDAC / Reg Number"
              />
              {errors.nafdacNumber && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.nafdacNumber.message}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold transition shadow-lg active:scale-[0.97] disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
