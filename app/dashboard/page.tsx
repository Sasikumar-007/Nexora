"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  Flame,
  Zap,
  BookOpen,
  HelpCircle,
  Layers,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Calendar,
  Activity,
  Binary,
  Database,
  Cpu,
} from "lucide-react";
import {
  MOCK_PROFILE,
  MOCK_DOCUMENTS,
  MOCK_FLASHCARD_SETS,
  MOCK_REVISION_PLAN,
} from "@/lib/demo/mock-data";
import { formatFileSize } from "@/lib/utils";
import {
  getStoredDocuments,
  ExtendedDocumentRecord,
} from "@/lib/documents/store";

export default function DashboardPage() {
  const [documents, setDocuments] = useState<ExtendedDocumentRecord[]>(MOCK_DOCUMENTS);
  const [tasks, setTasks] = useState(MOCK_REVISION_PLAN.tasks);
  const [readinessScore, setReadinessScore] = useState(84);

  useEffect(() => {
    setDocuments(getStoredDocuments());
  }, []);

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t
      )
    );
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <AppShell title="Student Learning Dashboard">
      <div className="space-y-8">
        {/* Weaviate Hero Command Card */}
        <div className="card-weaviate bg-white p-6 sm:p-8 relative overflow-hidden border border-[#DEDCEF]">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DEDCEF] bg-[#F7F9FD] px-3.5 py-1 text-xs font-mono font-semibold text-[#1D156B] mb-3">
              <span className="h-2 w-2 rounded-full bg-[#CFDE22] animate-pulse" />
              <span>5-DAY STUDY STREAK // CONSISTENCY HIGH</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-[#1D156B]">
              Welcome back, {MOCK_PROFILE.full_name}.
            </h1>

            <p className="text-[#4C4B84] text-sm sm:text-base mt-2 leading-relaxed">
              Target syllabus: <strong className="text-[#1D156B] font-semibold">{MOCK_PROFILE.target_exam}</strong>. Your uploaded course PDFs are processed and ready for interactive Q&A and active recall.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/chat"
                className="btn-weaviate-primary text-xs px-5 py-2.5 gap-2"
              >
                <Sparkles className="h-3.5 w-3.5" /> Ask AI Study Tutor
              </Link>
              <Link
                href="/materials"
                className="btn-weaviate-secondary text-xs px-5 py-2.5 gap-2"
              >
                <Plus className="h-3.5 w-3.5" /> Upload Study PDF
              </Link>
            </div>
          </div>

          {/* Weaviate Exam Readiness Gauge on Desktop */}
          <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center justify-center p-6 rounded-2xl border border-[#DEDCEF] bg-[#F7F9FD] shadow-card-weaviate w-56">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#8396B1] mb-1 font-semibold">
              Readiness Index
            </div>
            <div className="text-5xl font-black font-display text-[#1D156B] my-1 tracking-tight">
              {readinessScore}%
            </div>
            <div className="w-full bg-[#DEDCEF] rounded-full h-2.5 mt-2 overflow-hidden">
              <div
                className="bg-[#CFDE22] h-full rounded-full transition-all duration-500 shadow-glow-lime-sm"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-[#4C4B84] mt-2.5 font-medium">
              Target: Board Top Decile
            </span>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-weaviate p-5 bg-white">
            <div className="flex items-center justify-between text-[#8396B1] mb-2 font-mono text-xs">
              <span>LEARNING STREAK</span>
              <Flame className="h-4 w-4 text-[#CFDE22] fill-[#CFDE22]" />
            </div>
            <div className="text-3xl font-bold font-display text-[#1D156B]">5 Days</div>
            <p className="text-xs font-mono text-[#8396B1] mt-1">Consistency High</p>
          </div>

          <div className="card-weaviate p-5 bg-white">
            <div className="flex items-center justify-between text-[#8396B1] mb-2 font-mono text-xs">
              <span>QUIZ ACCURACY</span>
              <HelpCircle className="h-4 w-4 text-[#4C4B84]" />
            </div>
            <div className="text-3xl font-bold font-display text-[#1D156B]">88%</div>
            <p className="text-xs font-mono text-[#8396B1] mt-1">7 of 8 Correct</p>
          </div>

          <div className="card-weaviate p-5 bg-white">
            <div className="flex items-center justify-between text-[#8396B1] mb-2 font-mono text-xs">
              <span>ACTIVE RECALL</span>
              <Layers className="h-4 w-4 text-[#4C4B84]" />
            </div>
            <div className="text-3xl font-bold font-display text-[#1D156B]">4 / 6</div>
            <p className="text-xs font-mono text-[#8396B1] mt-1">Cards Mastered</p>
          </div>

          <div className="card-weaviate p-5 bg-white">
            <div className="flex items-center justify-between text-[#8396B1] mb-2 font-mono text-xs">
              <span>COURSE MATERIALS</span>
              <BookOpen className="h-4 w-4 text-[#CFDE22]" />
            </div>
            <div className="text-3xl font-bold font-display text-[#1D156B]">
              {documents.length} Docs
            </div>
            <p className="text-xs font-mono text-[#8396B1] mt-1">Indexed & Ready to Learn</p>
          </div>
        </div>

        {/* Main Split Grid: Materials & Study Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Study Documents (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-[#1D156B] flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#4C4B84]" /> Indexed Study Materials
              </h2>
              <Link
                href="/materials"
                className="text-xs font-mono font-bold text-[#1D156B] hover:text-[#4C4B84] inline-flex items-center gap-1"
              >
                View library ({documents.length}) <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="card-weaviate-hover p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-[#F7F9FD] border border-[#DEDCEF] flex items-center justify-center shrink-0 text-[#1D156B]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold font-display text-[#1D156B] text-sm sm:text-base leading-snug">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-2.5 text-xs font-mono text-[#8396B1] mt-1">
                        <span>{doc.page_count} Pages</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span className="inline-flex items-center text-xs font-bold text-[#1D156B] bg-[#DCF090] px-2 py-0.5 rounded">
                          Ready to Learn
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fast Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/chat?docId=${doc.id}`}
                      className="px-3.5 py-1.5 rounded-full bg-[#CFDE22] text-xs font-bold text-[#1D156B] border border-[#B8C816] shadow-glow-lime-sm hover:bg-[#D8E633] transition-all"
                    >
                      Chat
                    </Link>
                    <Link
                      href={`/summaries?docId=${doc.id}`}
                      className="px-3.5 py-1.5 rounded-full bg-white text-xs font-semibold text-[#1D156B] border border-[#DEDCEF] hover:bg-[#F7F9FD] transition-all"
                    >
                      Summary
                    </Link>
                    <Link
                      href={`/quizzes?docId=${doc.id}`}
                      className="px-3.5 py-1.5 rounded-full bg-white text-xs font-semibold text-[#1D156B] border border-[#DEDCEF] hover:bg-[#F7F9FD] transition-all"
                    >
                      Quiz
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Study Coach Recommendation Box */}
            <div className="card-weaviate bg-[#F7F9FD] p-6 border border-[#DEDCEF] relative overflow-hidden">
              <div className="flex items-center gap-2 font-bold font-display text-sm text-[#1D156B] mb-2">
                <Sparkles className="h-4 w-4 text-[#CFDE22]" /> AI Study Diagnostic & Recommendation
              </div>
              <p className="text-xs sm:text-sm text-[#4C4B84] leading-relaxed mb-4">
                AI diagnostic analysis indicates high mastery over <strong>Algorithms & Time Complexity</strong> (100% on Big-O runtimes). However, <strong>Dynamic Programming & Graph Traversal</strong> concepts show a higher error rate. Targeted flashcard recall recommended before your board exam in 18 days.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/quizzes"
                  className="btn-weaviate-primary text-xs px-4 py-2 gap-1.5"
                >
                  Generate 5 DP Questions
                </Link>
                <Link
                  href="/flashcards"
                  className="btn-weaviate-secondary text-xs px-4 py-2"
                >
                  Review Flashcards
                </Link>
              </div>
            </div>
          </div>

          {/* Revision Tasks Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-[#1D156B] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#4C4B84]" /> Priority Tasks
              </h2>
              <Link
                href="/planner"
                className="text-xs font-mono font-bold text-[#1D156B] hover:text-[#4C4B84]"
              >
                Open Planner
              </Link>
            </div>

            <div className="card-weaviate p-5 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-[#DEDCEF] pb-3">
                <div>
                  <div className="text-xs font-mono text-[#8396B1]">
                    Target: {MOCK_REVISION_PLAN.exam_date}
                  </div>
                  <div className="text-xs font-bold text-[#1D156B]">
                    {completedCount} of {tasks.length} Completed
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-[#DCF090] text-[#1D156B] px-2.5 py-1 rounded-full border border-[#CFDE22]">
                  18 Days Remaining
                </span>
              </div>

              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-start gap-3 p-2.5 rounded-xl border border-[#DEDCEF] hover:border-[#1D156B]/30 hover:bg-[#F7F9FD] transition-all cursor-pointer select-none"
                  >
                    <button
                      type="button"
                      className={`h-4 w-4 rounded border border-[#1D156B] flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        task.status === "completed" ? "bg-[#1D156B]" : "bg-white"
                      }`}
                    >
                      {task.status === "completed" && (
                        <CheckCircle2 className="h-3 w-3 text-[#CFDE22]" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`text-xs font-semibold text-[#1D156B] leading-snug ${
                          task.status === "completed" ? "line-through text-[#8396B1]" : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#8396B1] mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{task.estimated_minutes}m</span>
                        <span>•</span>
                        <span>{task.topic}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/planner"
                className="block text-center w-full py-2.5 rounded-full border border-[#DEDCEF] bg-[#F7F9FD] text-xs font-bold text-[#1D156B] hover:bg-[#DCF090]/40 transition-colors"
              >
                + Add / Generate Tasks
              </Link>
            </div>

            {/* Featured Flashcard Deck Card */}
            <div className="card-weaviate p-5 bg-[#1D156B] text-white shadow-glow-ink">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-[#DCF090] font-semibold">
                  FEATURED ACTIVE DECK
                </span>
                <span className="text-[10px] font-mono font-bold text-[#1D156B] bg-[#CFDE22] px-2 py-0.5 rounded-full">
                  4 / 6 Mastered
                </span>
              </div>
              <h4 className="font-bold font-display text-white text-sm">
                DSA High-Yield Flashcard Deck
              </h4>
              <p className="text-xs text-[#A2B9C0] mt-1 leading-relaxed">
                Key questions on QuickSort, Dijkstra shortest path, trees, and Big-O asymptotics.
              </p>
              <Link
                href="/flashcards"
                className="inline-flex items-center justify-center font-bold px-4 py-2.5 rounded-full bg-[#CFDE22] text-[#1D156B] text-xs hover:bg-[#D8E633] w-full mt-4 transition-all"
              >
                Practice Flashcards Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
