"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NexoraLogo } from "@/components/ui/nexora-logo";
import {
  ArrowRight,
  Sparkles,
  Search,
  FileText,
  Layers,
  CheckCircle2,
  BookOpen,
  Brain,
  HelpCircle,
  Clock,
  Flame,
  ChevronRight,
  UploadCloud,
  GraduationCap,
  MessageSquareQuote,
  CalendarCheck2,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const [activeSubject, setActiveSubject] = useState(0);

  const sampleSubjects = [
    {
      name: "Computer Science",
      doc: "Data_Structures_&_Algorithms.pdf",
      pages: 42,
      question: "How does Dijkstra's algorithm guarantee the shortest path?",
      citation: "Page 14, Theorem 3.2: Dijkstra maintains a priority queue of unvisited vertices...",
      answer: "Dijkstra's algorithm uses a greedy approach, always exploring the vertex with the lowest tentative distance from the source. Because all edge weights are non-negative, once a node is finalized, its shortest path distance is permanently proven.",
      flashcardsCount: 12,
      quizReady: true,
    },
    {
      name: "Medical & Biology",
      doc: "Human_Anatomy_&_Cell_Biology.pdf",
      pages: 68,
      question: "What is the primary role of ATP synthase in cellular respiration?",
      citation: "Page 29, Section 4.1: The proton gradient across the mitochondrial inner membrane...",
      answer: "ATP synthase acts as a microscopic rotary engine powered by the chemiosmotic proton gradient. As protons flow through F0, it drives the mechanical rotation of F1 to synthesize ATP from ADP and inorganic phosphate.",
      flashcardsCount: 16,
      quizReady: true,
    },
    {
      name: "Economics & Business",
      doc: "Macroeconomics_Principles_2026.pdf",
      pages: 54,
      question: "How does an increase in interest rates curb demand-pull inflation?",
      citation: "Page 38, Chapter 6: Monetary policy transmission mechanisms dictate that higher repo rates...",
      answer: "Higher interest rates increase borrowing costs for businesses and households, incentivizing saving over spending. This contracts aggregate demand, cooling down overheating prices and curbing demand-pull inflation.",
      flashcardsCount: 10,
      quizReady: true,
    },
  ];

  const currentSubject = sampleSubjects[activeSubject];

  return (
    <div className="min-h-screen bg-[#F7F9FD] text-[#1D156B] bg-grid-tech selection:bg-[#DCF090] selection:text-[#1D156B]">
      {/* Weaviate Floating Capsule Masthead */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 pt-3 sm:pt-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-[#DEDCEF] bg-white/80 py-2.5 px-4 sm:px-6 shadow-sm backdrop-blur-xl">
          {/* Brand */}
          <NexoraLogo href="/" size={38} showSubtitle />

          {/* Student Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <Link
              href="/materials"
              className="px-3.5 py-1.5 rounded-full text-[#4C4B84] hover:text-[#1D156B] hover:bg-[#F7F9FD] transition-colors"
            >
              Upload PDF
            </Link>
            <Link
              href="/chat"
              className="px-3.5 py-1.5 rounded-full text-[#4C4B84] hover:text-[#1D156B] hover:bg-[#F7F9FD] transition-colors"
            >
              AI Tutor & Q&A
            </Link>
            <Link
              href="/flashcards"
              className="px-3.5 py-1.5 rounded-full text-[#4C4B84] hover:text-[#1D156B] hover:bg-[#F7F9FD] transition-colors"
            >
              Active Flashcards
            </Link>
            <Link
              href="/quizzes"
              className="px-3.5 py-1.5 rounded-full text-[#4C4B84] hover:text-[#1D156B] hover:bg-[#F7F9FD] transition-colors"
            >
              AI Practice Quizzes
            </Link>
            <Link
              href="/planner"
              className="px-3.5 py-1.5 rounded-full text-[#4C4B84] hover:text-[#1D156B] hover:bg-[#F7F9FD] transition-colors"
            >
              Exam Planner
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-[#4C4B84] hover:text-[#1D156B] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#CFDE22] px-4 py-1.5 text-xs font-bold text-[#1D156B] border border-[#B8C816] shadow-glow-lime-sm hover:bg-[#D8E633] transition-all duration-150"
            >
              Start Learning
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section — Split Studio Macrostructure for Students */}
      <section className="relative px-4 sm:px-6 pt-12 sm:pt-20 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Student-Focused Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DEDCEF] bg-white px-3.5 py-1.5 text-xs font-semibold shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#CFDE22] animate-pulse" />
              <span className="font-mono text-[#1D156B]">AI LEARNING PLATFORM FOR STUDENTS</span>
              <span className="rounded-full bg-[#DCF090] px-2 py-0.2 text-[10px] font-bold text-[#1D156B]">
                FREE FOR LEARNERS
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1D156B] leading-[1.08]">
              Upload Your Study PDFs. Master Any Subject with <span className="underline decoration-[#CFDE22] decoration-wavy decoration-4">Personal AI</span>.
            </h1>

            <p className="text-base sm:text-lg text-[#4C4B84] leading-relaxed max-w-xl">
              Turn thick textbooks, lecture slides, and scanned study notes into an intelligent personal tutor. Ask questions with exact page references, test yourself with 3D flashcards, and prepare for board exams.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/materials"
                className="btn-weaviate-primary gap-2"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload PDF to Learn (20MB)</span>
              </Link>
              <Link
                href="/dashboard"
                className="btn-weaviate-secondary gap-2"
              >
                <Sparkles className="h-4 w-4 text-[#CFDE22]" />
                <span>Explore Student Dashboard</span>
              </Link>
            </div>

            {/* Social Proof & Metrics for Students */}
            <div className="pt-6 border-t border-[#DEDCEF] grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <div className="text-2xl font-bold font-display text-[#1D156B] tracking-tight">
                  100%
                </div>
                <div className="text-xs text-[#8396B1] font-mono">Grounded to Your Notes</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-[#1D156B] tracking-tight">
                  Instant
                </div>
                <div className="text-xs text-[#8396B1] font-mono">Page-Exact Citations</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-[#1D156B] tracking-tight">
                  3x Better
                </div>
                <div className="text-xs text-[#8396B1] font-mono">Exam Retention Rate</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Student PDF Intelligence Demo */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-[#DEDCEF] bg-white p-5 sm:p-6 shadow-card-hover relative overflow-hidden">
              
              {/* Studio Window Chrome */}
              <div className="flex items-center justify-between border-b border-[#DEDCEF] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#CFDE22] border border-[#B8C816]" />
                  <span className="h-3 w-3 rounded-full bg-[#DCF090]" />
                  <span className="h-3 w-3 rounded-full bg-[#DEDCEF]" />
                  <div className="ml-2 flex items-center gap-1.5 font-mono text-xs text-[#8396B1] font-medium">
                    <div className="h-4 w-4 rounded-md overflow-hidden relative shrink-0 bg-[#0B092B] border border-[#372E8A]/40">
                      <Image src="/logo.png" alt="" width={16} height={16} className="object-cover w-full h-full" />
                    </div>
                    <span>student-pdf-viewer.nexora</span>
                  </div>
                </div>
                <span className="badge-weaviate-lime font-mono">
                  LIVE PDF ASSISTANT
                </span>
              </div>

              {/* Sample PDF Selector Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {sampleSubjects.map((s, idx) => (
                  <button
                    key={s.name}
                    onClick={() => setActiveSubject(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                      activeSubject === idx
                        ? "bg-[#1D156B] text-white shadow-glow-ink"
                        : "bg-[#F7F9FD] text-[#4C4B84] border border-[#DEDCEF] hover:bg-white"
                    }`}
                  >
                    📄 {s.name}
                  </button>
                ))}
              </div>

              {/* Ingested PDF Info Pill */}
              <div className="p-3 rounded-xl border border-[#DEDCEF] bg-[#F7F9FD] flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className="h-4 w-4 text-[#1D156B] shrink-0" />
                  <span className="text-xs font-bold text-[#1D156B] truncate">
                    {currentSubject.doc}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#8396B1] shrink-0">
                  {currentSubject.pages} Pages Indexed
                </span>
              </div>

              {/* Student Question Box */}
              <div className="space-y-2 mb-4">
                <span className="text-[11px] font-mono uppercase text-[#8396B1] font-bold">
                  STUDENT QUESTION:
                </span>
                <div className="p-3 rounded-xl border border-[#DEDCEF] bg-white text-xs font-semibold text-[#1D156B] flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-[#CFDE22] shrink-0" />
                  <span>&ldquo;{currentSubject.question}&rdquo;</span>
                </div>
              </div>

              {/* Grounded Citation & AI Answer */}
              <div className="p-4 rounded-xl border border-[#DEDCEF] bg-[#F7F9FD] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono font-bold text-[#1D156B] bg-[#DCF090] px-2 py-0.5 rounded">
                    📌 EXACT CITATION: {currentSubject.citation.split(":")[0]}
                  </span>
                  <span className="text-[11px] font-mono text-[#8396B1]">
                    Confidence: 98%
                  </span>
                </div>

                <p className="text-xs text-[#4C4B84] leading-relaxed">
                  {currentSubject.answer}
                </p>

                {/* Instant Study Aids Generated */}
                <div className="pt-2 border-t border-[#DEDCEF] flex flex-wrap items-center gap-2">
                  <Link
                    href="/flashcards"
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-[#CFDE22] text-[#1D156B] px-2.5 py-1 rounded-full hover:bg-[#D8E633] transition-all"
                  >
                    <Layers className="h-3 w-3" />
                    {currentSubject.flashcardsCount} Flashcards Generated
                  </Link>
                  <Link
                    href="/quizzes"
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-white text-[#1D156B] border border-[#DEDCEF] px-2.5 py-1 rounded-full hover:bg-[#F7F9FD] transition-all"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Practice Quiz Ready
                  </Link>
                </div>
              </div>

              {/* Try It Live Button */}
              <div className="mt-4 pt-3 flex items-center justify-between font-mono text-xs">
                <span className="text-[#8396B1]">Want to test with your own PDF?</span>
                <Link
                  href="/materials"
                  className="font-bold text-[#1D156B] hover:text-[#4C4B84] flex items-center gap-1 underline"
                >
                  Upload Your PDF Now <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* How It Works — 4 Easy Steps for Students */}
      <section className="border-y border-[#DEDCEF] bg-white py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="badge-weaviate-lime font-mono">
              HOW STUDENTS USE NEXORA
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#1D156B] tracking-tight">
              4 Steps from PDF Upload to Exam Mastery
            </h2>
            <p className="text-sm text-[#4C4B84]">
              Stop re-reading textbooks passively. Turn your syllabus into an active, interactive study loop.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Upload Your Course PDF",
                desc: "Drop in lecture slides, textbooks, or scanned revision sheets up to 20MB. Optical character recognition (OCR) handles scanned pages automatically.",
                icon: UploadCloud,
              },
              {
                step: "02",
                title: "Ask Grounded Questions",
                desc: "Ask your AI tutor anything. Every explanation quotes the exact page number and text snippet from your uploaded material so you can verify.",
                icon: MessageSquareQuote,
              },
              {
                step: "03",
                title: "Study 3D Flashcards",
                desc: "Generate active recall flashcards with spaced repetition. Flip cards in 3D, test definitions, and lock concepts into long-term memory.",
                icon: Layers,
              },
              {
                step: "04",
                title: "Practice AI Quizzes",
                desc: "Take timed multiple-choice tests with step-by-step answer explanations and track your readiness percentage before board exams.",
                icon: HelpCircle,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="card-weaviate p-6 flex flex-col justify-between hover:border-[#1D156B]/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F9FD] text-[#1D156B] border border-[#DEDCEF]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#8396B1]">
                        STEP {s.step}
                      </span>
                    </div>
                    <h3 className="font-bold font-display text-base text-[#1D156B]">
                      {s.title}
                    </h3>
                    <p className="text-xs text-[#4C4B84] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="badge-weaviate-lime font-mono">
            BUILT FOR HIGH-ACHIEVING STUDENTS
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#1D156B] tracking-tight">
            Everything You Need to Ace Your Exams.
          </h2>
          <p className="text-[#4C4B84] text-base sm:text-lg">
            Built from learning science: active recall, spaced repetition, grounded feedback, and verbal voice tutoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="card-weaviate p-8 flex flex-col justify-between hover:shadow-card-hover transition-all group">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCF090] text-[#1D156B] group-hover:scale-105 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs font-bold text-[#8396B1]">
                FEATURE // RAG STUDY TUTOR
              </span>
              <h3 className="font-display text-2xl font-bold text-[#1D156B]">
                Ask Anything from Your Syllabus
              </h3>
              <p className="text-sm text-[#4C4B84] leading-relaxed">
                No hallucinations. The AI tutor quotes the exact page and chapter from your textbook so you know the answer directly corresponds to what will be tested.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-[#DEDCEF]">
              <Link
                href="/chat"
                className="text-xs font-bold text-[#1D156B] inline-flex items-center gap-1 hover:text-[#4C4B84]"
              >
                Try Grounded Q&A Chat <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card-weaviate p-8 flex flex-col justify-between hover:shadow-card-hover transition-all group">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CFDE22] text-[#1D156B] group-hover:scale-105 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs font-bold text-[#8396B1]">
                FEATURE // ACTIVE RECALL
              </span>
              <h3 className="font-display text-2xl font-bold text-[#1D156B]">
                Interactive 3D Flashcard Decks
              </h3>
              <p className="text-sm text-[#4C4B84] leading-relaxed">
                Automatically generate high-yield question & answer cards from your uploaded files. Spaced repetition tracks which cards you've mastered and which need review.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-[#DEDCEF]">
              <Link
                href="/flashcards"
                className="text-xs font-bold text-[#1D156B] inline-flex items-center gap-1 hover:text-[#4C4B84]"
              >
                Practice Flashcard Decks <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card-weaviate p-8 flex flex-col justify-between hover:shadow-card-hover transition-all group">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCF090] text-[#1D156B] group-hover:scale-105 transition-transform">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs font-bold text-[#8396B1]">
                FEATURE // EXAM TELEMETRY
              </span>
              <h3 className="font-display text-2xl font-bold text-[#1D156B]">
                Exam Readiness & Weak Area Analysis
              </h3>
              <p className="text-sm text-[#4C4B84] leading-relaxed">
                Track your study streak, review minutes, and quiz scores. The AI study coach identifies weak topics so you spend revision time where it matters most.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-[#DEDCEF]">
              <Link
                href="/progress"
                className="text-xs font-bold text-[#1D156B] inline-flex items-center gap-1 hover:text-[#4C4B84]"
              >
                Inspect Readiness Metrics <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom Hero with CTA — Deep Ink Weaviate Banner */}
      <section className="px-4 sm:px-6 pb-20 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-[#1D156B] text-white p-8 sm:p-14 relative overflow-hidden shadow-glow-ink">
          
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-[#DCF090] border border-white/15">
              READY FOR YOUR NEXT EXAM
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Upload your syllabus. Start learning with your AI companion today.
            </h2>

            <p className="text-[#A2B9C0] text-base sm:text-lg leading-relaxed">
              Join thousands of students studying smarter with grounded Q&A, active-recall flashcards, voice tutoring, and custom revision planners.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/materials"
                className="inline-flex items-center justify-center font-bold px-7 py-3.5 rounded-full bg-[#CFDE22] text-[#1D156B] hover:bg-[#D8E633] shadow-glow-lime transition-all duration-150 text-sm gap-2"
              >
                <UploadCloud className="h-4 w-4" />
                Upload PDF & Start Learning
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center font-semibold px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-150 text-sm"
              >
                Open Demo Dashboard
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Weaviate Footer */}
      <footer className="border-t border-[#DEDCEF] bg-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <NexoraLogo href="/" size={36} showSubtitle />

          <div className="text-xs font-mono text-[#8396B1]">
            Designed for students to upload PDFs, ask grounded questions, and master exams.
          </div>

          <div className="flex items-center gap-6 text-xs text-[#4C4B84] font-medium">
            <Link href="/materials" className="hover:text-[#1D156B]">
              Upload PDF
            </Link>
            <Link href="/chat" className="hover:text-[#1D156B]">
              AI Tutor
            </Link>
            <Link href="/flashcards" className="hover:text-[#1D156B]">
              Flashcards
            </Link>
            <Link href="/quizzes" className="hover:text-[#1D156B]">
              Practice Quizzes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
