"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_PROFILE } from "@/lib/demo/mock-data";

export interface UserSession {
  id?: string;
  email: string;
  fullName: string;
  initials: string;
  role: string;
  targetExam: string;
  dailyStudyGoal: number;
  isDemo?: boolean;
}

interface UserContextType {
  user: UserSession;
  loading: boolean;
  loginUser: (email: string, fullName?: string, id?: string) => void;
  updateProfile: (data: { fullName?: string; targetExam?: string; dailyGoal?: number }) => Promise<void>;
  logout: () => Promise<void>;
}

export function formatNameFromEmail(email: string): string {
  if (!email) return "Student Scholar";
  const prefix = email.split("@")[0];
  // Strip numbers if they are trailing or leading, clean separators
  const cleaned = prefix.replace(/[0-9]/g, " ").trim();
  const parts = (cleaned || prefix).split(/[._\-\s]+/).filter(Boolean);
  if (parts.length > 0) {
    return parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(" ");
  }
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

export function getInitials(name: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length === 1) {
      return parts[0].toUpperCase();
    }
  }
  if (email && email.trim()) {
    const cleanEmail = email.trim();
    return cleanEmail.slice(0, 2).toUpperCase();
  }
  return "ST";
}

const STORAGE_KEY = "nexora_active_user";

const DEFAULT_USER: UserSession = {
  id: MOCK_PROFILE.id,
  email: "alex.morgan@university.edu",
  fullName: MOCK_PROFILE.full_name || "Alex Morgan",
  initials: getInitials(MOCK_PROFILE.full_name || "Alex Morgan"),
  role: "Student Scholar",
  targetExam: MOCK_PROFILE.target_exam,
  dailyStudyGoal: MOCK_PROFILE.daily_study_goal_mins,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession>(DEFAULT_USER);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage and Supabase Auth
  useEffect(() => {
    let active = true;

    const initUser = async () => {
      // 1. First check localStorage for immediate render without layout flicker
      let savedUser: UserSession | null = null;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          savedUser = JSON.parse(stored);
          if (savedUser && active) {
            setUser(savedUser);
          }
        }
      } catch (e) {
        console.error("Failed to parse cached user:", e);
      }

      // 2. If Supabase is configured, check actual active session
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const { data: { user: authUser } } = await supabase.auth.getUser();

          if (authUser && active) {
            const email = authUser.email || "";
            let name =
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.name ||
              "";

            // Try fetching from profiles table
            if (!name) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, target_exam, daily_study_goal_mins")
                .eq("id", authUser.id)
                .single();

              if (profile?.full_name) {
                name = profile.full_name;
              }
            }

            // Fallback to name derived from email if not set
            const resolvedName = name || (email ? formatNameFromEmail(email) : "Student Scholar");
            const resolvedInitials = getInitials(resolvedName, email);

            const updatedUser: UserSession = {
              id: authUser.id,
              email: email || (savedUser?.email ?? DEFAULT_USER.email),
              fullName: resolvedName,
              initials: resolvedInitials,
              role: "Student Scholar",
              targetExam: savedUser?.targetExam || DEFAULT_USER.targetExam,
              dailyStudyGoal: savedUser?.dailyStudyGoal || DEFAULT_USER.dailyStudyGoal,
            };

            setUser(updatedUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
          }
        } catch (err) {
          console.warn("Supabase user session check error:", err);
        }
      }

      if (active) setLoading(false);
    };

    initUser();

    // Listen to Supabase auth state changes
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!active) return;

            if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
              if (session?.user) {
                const email = session.user.email || "";
                const name =
                  session.user.user_metadata?.full_name ||
                  session.user.user_metadata?.name ||
                  (email ? formatNameFromEmail(email) : "Student Scholar");

                const updatedUser: UserSession = {
                  id: session.user.id,
                  email,
                  fullName: name,
                  initials: getInitials(name, email),
                  role: "Student Scholar",
                  targetExam: DEFAULT_USER.targetExam,
                  dailyStudyGoal: DEFAULT_USER.dailyStudyGoal,
                };
                setUser(updatedUser);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
              }
            } else if (event === "SIGNED_OUT") {
              localStorage.removeItem(STORAGE_KEY);
              setUser(DEFAULT_USER);
            }
          }
        );

        return () => {
          active = false;
          subscription.unsubscribe();
        };
      } catch (err) {
        console.warn("Auth listener registration failed:", err);
      }
    }

    return () => {
      active = false;
    };
  }, []);

  // Handler to set user upon login or register
  const loginUser = useCallback(
    (email: string, fullName?: string, id?: string) => {
      const cleanEmail = email.trim();
      const derivedName = fullName && fullName.trim() ? fullName.trim() : formatNameFromEmail(cleanEmail);
      const initials = getInitials(derivedName, cleanEmail);

      const newUser: UserSession = {
        id: id || `user-${Date.now()}`,
        email: cleanEmail,
        fullName: derivedName,
        initials,
        role: "Student Scholar",
        targetExam: DEFAULT_USER.targetExam,
        dailyStudyGoal: DEFAULT_USER.dailyStudyGoal,
      };

      setUser(newUser);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } catch (e) {
        console.error("Failed to save user session:", e);
      }
    },
    []
  );

  // Handler to update user profile
  const updateProfile = useCallback(
    async (data: { fullName?: string; targetExam?: string; dailyGoal?: number }) => {
      const newFullName = data.fullName !== undefined ? data.fullName.trim() : user.fullName;
      const newTargetExam = data.targetExam !== undefined ? data.targetExam : user.targetExam;
      const newDailyGoal = data.dailyGoal !== undefined ? data.dailyGoal : user.dailyStudyGoal;
      const initials = getInitials(newFullName, user.email);

      const updated: UserSession = {
        ...user,
        fullName: newFullName,
        initials,
        targetExam: newTargetExam,
        dailyStudyGoal: newDailyGoal,
      };

      setUser(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to update user session in storage:", e);
      }

      // Update in Supabase if configured & user is authenticated
      if (isSupabaseConfigured() && user.id && !user.id.startsWith("user-demo")) {
        try {
          const supabase = createClient();
          await supabase.auth.updateUser({
            data: { full_name: newFullName },
          });
          await supabase
            .from("profiles")
            .update({
              full_name: newFullName,
              target_exam: newTargetExam,
              daily_study_goal_mins: newDailyGoal,
            })
            .eq("id", user.id);
        } catch (err) {
          console.warn("Supabase profile sync error:", err);
        }
      }
    },
    [user]
  );

  // Handler to log out
  const logout = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setUser(DEFAULT_USER);
      router.push("/login");
    }
  }, [router]);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        loginUser,
        updateProfile,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
