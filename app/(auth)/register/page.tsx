"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NexoraLogo } from "@/components/ui/nexora-logo";
import { Lock, Mail, User, AlertCircle } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useUser } from "@/lib/auth/user-context";

export default function RegisterPage() {
  const router = useRouter();
  const { loginUser } = useUser();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      loginUser(email, fullName);
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        loginUser(email, fullName, data?.user?.id);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F7F9FD] bg-grid-tech px-6 py-12">
      {/* Brand */}
      <div className="mb-8">
        <NexoraLogo href="/" size={52} showSubtitle />
      </div>

      <div className="w-full max-w-md card-weaviate p-8 bg-white">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-display tracking-tight text-[#1D156B]">
            Create Student Account
          </h1>
          <p className="text-xs text-[#4C4B84] mt-1">
            Start mastering complex topics with your personal AI study tutor
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full rounded-xl border border-[#DEDCEF] px-4 py-2.5 text-xs sm:text-sm text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
              />
              <User className="absolute right-3.5 top-3 h-4 w-4 text-[#8396B1]" />
            </div>
          </div>

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
                placeholder="Minimum 6 characters"
                minLength={6}
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
            {loading ? "Creating account..." : "Complete Registration"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#8396B1]">
          Already registered?{" "}
          <Link href="/login" className="text-[#1D156B] underline font-bold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
