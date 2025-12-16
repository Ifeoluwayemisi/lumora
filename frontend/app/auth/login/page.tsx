"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = async (data: LoginInput) => {
    setIsSubmittingLogin(true);

    try {
      // 🔗 Replace with real API call
      // Example response from backend after login:
      const response = await new Promise<{
        role: string;
        hasCompletedOnboarding: boolean;
      }>((resolve) =>
        setTimeout(
          () =>
            resolve({
              role: "MANUFACTURER",
              hasCompletedOnboarding: false, // test first-time login
            }),
          1500
        )
      );

      // Redirect logic
      if (
        response.role === "MANUFACTURER" &&
        !response.hasCompletedOnboarding
      ) {
        router.push("/onboarding/manufacturer");
      } else if (response.role === "MANUFACTURER") {
        router.push("/dashboard/manufacturer");
      } else {
        router.push("/dashboard"); // fallback for other roles
      }
    } catch (err) {
      console.error("Login error", err);
      alert("Login failed. Try again.");
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <ShieldCheck className="text-green-500 mb-2" size={48} />
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">
            Protecting what matters most.
          </p>
        </div>

        <form onSubmit={handleSubmit(onLogin)} className="space-y-5">
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              {...register("email")}
              className={`w-full bg-black/40 border ${
                errors.email ? "border-red-500" : "border-white/10"
              } pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-green-500 text-white transition-all`}
              placeholder="Email Address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="password"
              {...register("password")}
              className={`w-full bg-black/40 border ${
                errors.password ? "border-red-500" : "border-white/10"
              } pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-green-500 text-white transition-all`}
              placeholder="Password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm px-1">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                className="accent-green-500 rounded border-white/10"
              />
              Remember me
            </label>
            <Link
              href="/auth/forgot_password"
              className="text-green-500 hover:text-green-400 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmittingLogin}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-green-900/20 active:scale-[0.98]"
          >
            {isSubmittingLogin ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-white font-bold hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
