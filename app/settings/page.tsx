"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Key,
  User,
  Bell,
  CheckCircle2,
  Save,
} from "lucide-react";
import { MOCK_PROFILE } from "@/lib/demo/mock-data";

export default function SettingsPage() {
  const [fullName, setFullName] = useState(MOCK_PROFILE.full_name || "Alex Morgan");
  const [targetExam, setTargetExam] = useState(MOCK_PROFILE.target_exam);
  const [dailyGoal, setDailyGoal] = useState(MOCK_PROFILE.daily_study_goal_mins);
  const [customApiKey, setCustomApiKey] = useState("");
  const [aiProvider, setAiProvider] = useState("openai");
  const [studyReminders, setStudyReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppShell title="Student Account & App Settings">
      <div className="space-y-8 max-w-4xl mx-auto">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Profile Card */}
          <div className="card-weaviate p-6 sm:p-8 bg-white">
            <div className="flex items-center gap-2 font-bold font-display text-base text-[#1D156B] mb-4">
              <User className="h-4 w-4 text-[#CFDE22]" /> Student Profile
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-[#DEDCEF] p-2.5 text-xs sm:text-sm text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-1.5">
                  Target Examination / Degree
                </label>
                <input
                  type="text"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full rounded-xl border border-[#DEDCEF] p-2.5 text-xs sm:text-sm text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-1.5">
                  Daily Study Target ({dailyGoal} Mins)
                </label>
                <input
                  type="range"
                  min="30"
                  max="180"
                  step="15"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full accent-[#CFDE22]"
                />
              </div>
            </div>
          </div>

          {/* AI Key & Provider Settings */}
          <div className="card-weaviate p-6 sm:p-8 bg-white">
            <div className="flex items-center gap-2 font-bold font-display text-base text-[#1D156B] mb-1">
              <Key className="h-4 w-4 text-[#CFDE22]" /> Custom AI Model Provider
            </div>
            <p className="text-xs text-[#4C4B84] mb-6">
              Optionally configure your own OpenAI or Gemini API Key. By default, Nexora handles requests via server-side environment secrets or the interactive simulation engine.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-1.5">
                  AI Model Provider
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full rounded-xl border border-[#DEDCEF] bg-white p-2.5 text-xs sm:text-sm text-[#1D156B] focus:outline-none"
                >
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="gemini">Google Gemini (OpenAI Compatibility Mode)</option>
                  <option value="groq">Groq (Llama 3 70B Fast Inference)</option>
                  <option value="openrouter">OpenRouter Multi-Model</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-1.5">
                  Custom AI API Key (Optional)
                </label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full rounded-xl border border-[#DEDCEF] p-2.5 text-xs sm:text-sm font-mono text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
                />
                <span className="text-[11px] font-mono text-[#8396B1] mt-1 block">
                  Keys are processed securely server-side and never exposed in browser script bundles.
                </span>
              </div>
            </div>
          </div>

          {/* Notifications Preferences */}
          <div className="card-weaviate p-6 sm:p-8 bg-white">
            <div className="flex items-center gap-2 font-bold font-display text-base text-[#1D156B] mb-4">
              <Bell className="h-4 w-4 text-[#CFDE22]" /> Notifications & Telemetry Alerts
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#DEDCEF] hover:bg-[#F7F9FD] cursor-pointer">
                <input
                  type="checkbox"
                  checked={studyReminders}
                  onChange={(e) => setStudyReminders(e.target.checked)}
                  className="h-4 w-4 rounded border-[#DEDCEF] accent-[#CFDE22]"
                />
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-[#1D156B] block">
                    Daily Study Reminders
                  </span>
                  <span className="text-xs text-[#8396B1]">
                    Receive morning alerts for scheduled revision planner tasks.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#DEDCEF] hover:bg-[#F7F9FD] cursor-pointer">
                <input
                  type="checkbox"
                  checked={streakAlerts}
                  onChange={(e) => setStreakAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-[#DEDCEF] accent-[#CFDE22]"
                />
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-[#1D156B] block">
                    Study Streak Milestones
                  </span>
                  <span className="text-xs text-[#8396B1]">
                    Get alerted when you maintain or increase your streak.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            {saved && (
              <span className="badge-weaviate-lime font-mono">
                <CheckCircle2 className="h-3.5 w-3.5" /> PREFERENCES SAVED SUCCESSFULLY
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                className="btn-weaviate-primary text-xs px-7 py-3 gap-2"
              >
                <Save className="h-4 w-4" /> Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
