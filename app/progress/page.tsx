"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  TrendingUp,
  Flame,
  HelpCircle,
  Layers,
  Sparkles,
  Trophy,
  AlertTriangle,
  ArrowRight,
  Database,
} from "lucide-react";
import Link from "next/link";
import {
  MOCK_PROFILE,
  MOCK_DOCUMENTS,
} from "@/lib/demo/mock-data";

export default function ProgressPage() {
  const [readinessScore] = useState(84);

  const weeklyActivity = [
    { day: "Mon", minutes: 45, height: "45%" },
    { day: "Tue", minutes: 60, height: "60%" },
    { day: "Wed", minutes: 90, height: "90%" },
    { day: "Thu", minutes: 75, height: "75%" },
    { day: "Fri", minutes: 80, height: "80%" },
    { day: "Sat", minutes: 105, height: "100%" },
    { day: "Sun", minutes: 70, height: "70%" },
  ];

  return (
    <AppShell title="Exam Readiness & Study Analytics">
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Readiness Gauge Hero Card */}
        <div className="card-weaviate p-6 sm:p-10 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Visual Gauge */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#F7F9FD] border border-[#DEDCEF]">
              <div className="text-xs font-mono uppercase text-[#8396B1] tracking-wider mb-2 font-semibold">
                Overall Readiness Score
              </div>
              <div className="relative flex items-center justify-center">
                <div className="text-6xl font-bold font-display text-[#1D156B] tracking-tight">
                  {readinessScore}%
                </div>
              </div>
              <div className="w-full bg-[#DEDCEF] rounded-full h-2.5 mt-4 overflow-hidden">
                <div
                  className="bg-[#CFDE22] h-full rounded-full shadow-glow-lime-sm"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-[#1D156B] mt-3">
                High Probability of Board Distinction
              </span>
            </div>

            {/* Explanation & Factor Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <span className="badge-weaviate-lime font-mono mb-2">
                  AI STUDY PROGRESS ENGINE
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#1D156B] tracking-tight">
                  Exam Readiness Evaluation
                </h2>
                <p className="text-xs sm:text-sm text-[#4C4B84] leading-relaxed mt-1">
                  Synthesized using active recall accuracy, spaced flashcard retention, study streak consistency, and syllabus coverage.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-xl border border-[#DEDCEF] bg-[#F7F9FD] p-3 font-mono">
                  <div className="text-xs text-[#8396B1]">Quiz Accuracy</div>
                  <div className="text-xl font-bold text-[#1D156B]">88%</div>
                  <div className="text-[10px] text-[#1D156B] font-semibold mt-0.5">
                    Weight: 40%
                  </div>
                </div>
                <div className="rounded-xl border border-[#DEDCEF] bg-[#F7F9FD] p-3 font-mono">
                  <div className="text-xs text-[#8396B1]">Milestones</div>
                  <div className="text-xl font-bold text-[#1D156B]">75%</div>
                  <div className="text-[10px] text-[#1D156B] font-semibold mt-0.5">
                    Weight: 30%
                  </div>
                </div>
                <div className="rounded-xl border border-[#DEDCEF] bg-[#F7F9FD] p-3 font-mono">
                  <div className="text-xs text-[#8396B1]">Study Streak</div>
                  <div className="text-xl font-bold text-[#1D156B]">5 Days</div>
                  <div className="text-[10px] text-[#1D156B] font-semibold mt-0.5">
                    Weight: 20%
                  </div>
                </div>
                <div className="rounded-xl border border-[#DEDCEF] bg-[#F7F9FD] p-3 font-mono">
                  <div className="text-xs text-[#8396B1]">Material Index</div>
                  <div className="text-xl font-bold text-[#1D156B]">3 Docs</div>
                  <div className="text-[10px] text-[#1D156B] font-semibold mt-0.5">
                    Weight: 10%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Study Activity Chart */}
        <div className="card-weaviate p-6 sm:p-8 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold font-display text-[#1D156B] tracking-tight">
                Weekly Study Minutes & Consistency
              </h3>
              <p className="text-xs text-[#8396B1] font-mono mt-0.5">
                Total this week: 525 Minutes (8.75 Hours)
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F9FD] px-3 py-1 text-xs font-mono font-bold text-[#1D156B] border border-[#DEDCEF]">
              <Flame className="h-4 w-4 text-[#CFDE22] fill-[#CFDE22]" /> +15% vs Prior Week
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between h-48 pt-6 px-4 border-b border-[#DEDCEF]">
            {weeklyActivity.map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end w-12">
                <span className="text-[10px] font-mono font-bold text-[#8396B1]">
                  {item.minutes}m
                </span>
                <div
                  className="w-full bg-[#CFDE22] rounded-t-lg transition-all duration-300 hover:bg-[#D8E633] shadow-glow-lime-sm"
                  style={{ height: item.height }}
                />
                <span className="text-xs font-mono font-bold text-[#1D156B] mt-1">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Diagnostics & Weak Topic Identification */}
        <div className="card-weaviate p-6 sm:p-8 bg-[#F7F9FD]">
          <div className="flex items-center gap-2 font-bold font-display text-base text-[#1D156B] mb-4">
            <Sparkles className="h-4 w-4 text-[#CFDE22]" /> AI Study Coach Diagnostics
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-weaviate p-4 bg-white">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-600 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> WEAK CLUSTER DETECTED
              </div>
              <h4 className="font-bold font-display text-sm text-[#1D156B] mb-1">
                Dynamic Programming & Graph Traversals
              </h4>
              <p className="text-xs text-[#4C4B84] leading-relaxed mb-3">
                Historical quiz analysis shows lower confidence in multi-step recursion limits and Dijkstra boundary rules.
              </p>
              <Link
                href="/quizzes"
                className="inline-flex items-center font-bold text-xs text-[#1D156B] hover:text-[#4C4B84] gap-1"
              >
                Launch Targeted 5-Question Quiz <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="card-weaviate p-4 bg-white">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-green-700 mb-1">
                <Trophy className="h-4 w-4 text-green-600" /> MASTERY CLUSTER ACHIEVED
              </div>
              <h4 className="font-bold font-display text-sm text-[#1D156B] mb-1">
                Asymptotic Analysis & Big-O Runtimes
              </h4>
              <p className="text-xs text-[#4C4B84] leading-relaxed mb-3">
                100% correct across 3 successive quizzes. Flashcard status upgraded to Mastered.
              </p>
              <Link
                href="/flashcards"
                className="inline-flex items-center font-bold text-xs text-[#1D156B] hover:text-[#4C4B84] gap-1"
              >
                Review Mastered Flashcards <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
