"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Bell,
  Plus,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { MOCK_NOTIFICATIONS } from "@/lib/demo/mock-data";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-[#DEDCEF] bg-white/90 backdrop-blur-md px-6 lg:px-10">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 lg:hidden rounded-xl border border-[#DEDCEF] bg-[#F7F9FD] text-[#1D156B] hover:bg-[#DCF090]/30 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5 text-[#1D156B]" />
        </button>

        {/* Mobile Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden bg-[#0B092B] border border-[#372E8A]/50 shadow-glow-ink shrink-0">
            <Image
              src="/logo.png"
              alt="Nexora"
              width={28}
              height={28}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="font-bold font-display text-lg tracking-tight text-[#1D156B]">
            Nexora<span className="text-[#CFDE22]">.</span>
          </span>
        </Link>

        {title && (
          <div className="hidden lg:flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1D156B]">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono bg-[#DCF090] text-[#1D156B] border border-[#CFDE22]">
              <div className="relative h-4 w-4 rounded-full overflow-hidden shrink-0">
                <Image src="/logo.png" alt="Nexora" width={16} height={16} className="object-cover w-full h-full" />
              </div>
              AI Study Companion
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Upload Button */}
        <Link
          href="/materials"
          className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#CFDE22] hover:bg-[#D8E633] px-4 py-2 text-xs font-bold text-[#1D156B] border border-[#B8C816] shadow-glow-lime-sm transition-all duration-150"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          Upload Study PDF
        </Link>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#DEDCEF] bg-white hover:bg-[#F7F9FD] hover:border-[#1D156B]/30 transition-all"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-[#1D156B]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#CFDE22] text-[10px] font-bold text-[#1D156B] border border-[#1D156B]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-[#DEDCEF] bg-white p-4 shadow-card-hover z-50">
              <div className="flex items-center justify-between border-b border-[#DEDCEF] pb-3 mb-3">
                <div className="font-bold text-sm text-[#1D156B] flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#4C4B84]" /> Study Alerts & Milestones
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-[#4C4B84] hover:text-[#1D156B] flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark read
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl border border-[#DEDCEF] bg-[#F7F9FD] p-3 text-left hover:border-[#1D156B]/30 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#4C4B84] mb-1">
                      <span className="text-[#1D156B] font-bold">{n.title}</span>
                      <span className="text-[10px] font-mono text-[#8396B1]">Just now</span>
                    </div>
                    <p className="text-xs text-[#4C4B84] leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
