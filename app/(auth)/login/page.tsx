"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NexoraLogo } from "@/components/ui/nexora-logo";
import { GraduationCap, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F7F9FD] flex flex-col justify-center items-center p-4 bg-grid-tech">
      {/* Brand */}
      <div className="mb-8">
        <NexoraLogo href="/" size={52} showSubtitle />
      </div>

      <div className="w-full max-w-md card-weaviate p-8 bg-white">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-display tracking-tight text-[#1D156B]">
            Welcome Back
          </h1>
          <p className="text-xs text-[#4C4B84] mt-1">
            Sign in to access your study library & AI study companion
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full rounded-xl border border-[#DEDCEF] px-4 py-2.5 text-xs sm:text-sm text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
              />
              <Mail className="absolute right-3.5 top-3 h-4 w-4 text-[#8396B1]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#DEDCEF] px-4 py-2.5 text-xs sm:text-sm text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
              />
              <Lock className="absolute right-3.5 top-3 h-4 w-4 text-[#8396B1]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-weaviate-primary py-2.5 text-xs font-bold mt-2"
          >
            {loading ? "Signing in..." : "Sign In to Nexora"}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#DEDCEF]" />
          </div>
          <span className="relative bg-white px-3 text-[10px] font-mono text-[#8396B1] uppercase">
            or instant preview
          </span>
        </div>

        {/* 1-Click Demo Button */}
        <button
          onClick={handleQuickDemo}
          type="button"
          className="w-full flex items-center justify-center gap-2 rounded-full border border-[#DEDCEF] bg-[#F7F9FD] px-4 py-2.5 text-xs font-bold text-[#1D156B] hover:bg-[#DCF090]/40 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#CFDE22]" />
          Instant Demo Access (No Password Required)
        </button>

        <div className="mt-6 text-center text-xs text-[#8396B1]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#1D156B] underline font-bold">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
