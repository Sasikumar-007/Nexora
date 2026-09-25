"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NexoraLogo } from "@/components/ui/nexora-logo";
import {
  LayoutDashboard,
  FileText,
  MessageSquareQuote,
  Sparkles,
  Layers,
  HelpCircle,
  Mic,
  CalendarCheck2,
  TrendingUp,
  Settings,
  Flame,
  GraduationCap,
  LogOut,
  X,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/auth/user-context";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Study Materials", href: "/materials", icon: FileText },
  { label: "AI Tutor & Q&A", href: "/chat", icon: MessageSquareQuote },
  { label: "AI Summaries", href: "/summaries", icon: Sparkles },
  { label: "3D Flashcards", href: "/flashcards", icon: Layers },
  { label: "Practice Quizzes", href: "/quizzes", icon: HelpCircle },
  { label: "Voice Tutor", href: "/voice-tutor", icon: Mic },
  { label: "Exam Planner", href: "/planner", icon: CalendarCheck2 },
  { label: "Readiness Analytics", href: "/progress", icon: TrendingUp },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useUser();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1D156B]/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-[#DEDCEF] bg-white transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-[#DEDCEF] px-6 bg-[#F7F9FD]">
          <NexoraLogo href="/dashboard" size={38} showSubtitle />

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg border border-[#DEDCEF] hover:bg-neutral-100 text-[#1D156B]"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Telemetry Streak Card */}
        <div className="p-4">
          <div className="flex items-center justify-between rounded-xl border border-[#DEDCEF] bg-[#F7F9FD] p-3 shadow-sm hover:border-[#1D156B]/30 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DCF090] text-[#1D156B]">
                <Flame className="h-4 w-4 text-[#1D156B] fill-[#CFDE22]" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#8396B1]">Study Streak</div>
                <div className="text-xs font-bold text-[#1D156B] font-mono">5 Days Active</div>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-[#CFDE22] px-2 py-0.5 text-[10px] font-bold text-[#1D156B] font-mono">
              +50 XP
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150",
                  isActive
                    ? "bg-[#1D156B] text-white shadow-glow-ink"
                    : "text-[#4C4B84] hover:bg-[#F7F9FD] hover:text-[#1D156B]"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-[#CFDE22]" : "text-[#8396B1]"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#CFDE22] animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="border-t border-[#DEDCEF] p-4 bg-[#F7F9FD]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className="h-9 w-9 shrink-0 rounded-xl bg-[#1D156B] text-[#CFDE22] flex items-center justify-center font-mono font-bold text-xs uppercase shadow-sm select-none"
                title={user.fullName || user.email}
              >
                {user.initials}
              </div>
              <div className="overflow-hidden min-w-0">
                <p
                  className="text-xs font-bold truncate text-[#1D156B]"
                  title={user.fullName || user.email}
                >
                  {user.fullName || user.email}
                </p>
                <p
                  className="text-[11px] text-[#8396B1] truncate font-mono"
                  title={user.email || user.role}
                >
                  {user.email || user.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              type="button"
              title="Sign Out"
              className="p-2 text-[#8396B1] hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-[#DEDCEF] transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
