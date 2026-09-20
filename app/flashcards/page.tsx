"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
  Flame,
  Binary,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MOCK_FLASHCARD_SETS } from "@/lib/demo/mock-data";
import { Flashcard } from "@/types/database";

export default function FlashcardsPage() {
  const [selectedDeckId, setSelectedDeckId] = useState(MOCK_FLASHCARD_SETS[0].id);
  const [cards, setCards] = useState<Flashcard[]>(MOCK_FLASHCARD_SETS[0].cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [genCount, setGenCount] = useState(5);

  const currentCard = cards[currentIndex] || cards[0];
  const masteredCount = cards.filter((c) => c.mastery_status === "mastered").length;
  const progressPercent = Math.round((masteredCount / cards.length) * 100) || 0;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (generatorOpen) return;
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        nextCard();
      } else if (e.code === "ArrowLeft") {
        prevCard();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, cards, generatorOpen]);

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const markMastery = (status: "mastered" | "review") => {
    const updated = [...cards];
    updated[currentIndex].mastery_status = status;
    setCards(updated);

    if (status === "mastered") {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#CFDE22", "#1D156B", "#DCF090", "#FFFFFF"],
        });
      } catch {}
    }

    nextCard();
  };

  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: genTopic || "Computer Science Fundamentals",
          count: genCount,
        }),
      });

      const data = await res.json();
      if (data.cards && data.cards.length > 0) {
        setCards(data.cards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setGeneratorOpen(false);
      }
    } catch (err) {
      console.error("Flashcard generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell title="Active Recall Flashcards">
      <div className="space-y-6 max-w-3xl mx-auto px-1 sm:px-4">
        {/* Top Header & Deck Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-weaviate-lime font-mono">
                <Flame className="h-3 w-3 fill-[#1D156B]" /> SPACED REPETITION
              </span>
              <span className="text-xs text-[#8396B1]">•</span>
              <span className="text-xs font-mono text-[#8396B1]">
                Card {currentIndex + 1} of {cards.length}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#1D156B] tracking-tight">
              {MOCK_FLASHCARD_SETS[0].title}
            </h2>
          </div>

          <button
            onClick={() => setGeneratorOpen(true)}
            className="btn-weaviate-primary text-xs px-4 py-2 self-start sm:self-auto shrink-0 gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Generate Deck
          </button>
        </div>

        {/* Stepped Progress Indicator */}
        <div className="card-weaviate p-4 bg-white">
          <div className="flex items-center justify-between text-xs font-mono text-[#1D156B] mb-3">
            <span className="flex items-center gap-1.5 font-bold">
              <Zap className="h-4 w-4 text-[#CFDE22] fill-[#CFDE22]" />
              Retention Index: {progressPercent}%
            </span>
            <span className="text-[#8396B1]">
              {masteredCount} of {cards.length} Cards Mastered
            </span>
          </div>

          {/* Stepped Nodes Progress Bar */}
          <div className="flex items-center gap-1.5 w-full">
            {cards.map((c, i) => {
              const isCurrent = i === currentIndex;
              const isMastered = c.mastery_status === "mastered";
              const isReview = c.mastery_status === "review";

              let bg = "bg-[#DEDCEF]";
              if (isMastered) bg = "bg-[#CFDE22]";
              else if (isReview) bg = "bg-amber-400";
              else if (isCurrent) bg = "bg-[#1D156B]";

              return (
                <button
                  key={i}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex(i);
                  }}
                  className={`h-2 flex-1 rounded-full transition-all ${bg} ${
                    isCurrent ? "ring-2 ring-[#1D156B] scale-y-125" : ""
                  }`}
                  title={`Card ${i + 1}: ${c.question.slice(0, 30)}...`}
                />
              );
            })}
          </div>
        </div>

        {/* 3D Interactive Flip Card */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative min-h-[340px] sm:min-h-[400px] w-full cursor-pointer perspective-1200 select-none"
        >
          <div
            className={`relative w-full h-[340px] sm:h-[400px] rounded-3xl transition-transform duration-500 transform-style-3d border border-[#DEDCEF] shadow-card-hover ${
              isFlipped ? "rotate-y-180" : ""
            }`}
          >
            {/* Front Face: Question */}
            <div className="absolute inset-0 h-full w-full rounded-3xl bg-white p-6 sm:p-10 flex flex-col justify-between backface-hidden">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#F7F9FD] px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#1D156B] border border-[#DEDCEF]">
                  {currentCard.card_type} • QUESTION
                </span>
                <span className="text-xs font-mono text-[#8396B1] flex items-center gap-1">
                  <RotateCw className="h-3 w-3" /> Click to flip
                </span>
              </div>

              <div className="text-center px-2 sm:px-6 my-auto">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-[#1D156B] leading-snug">
                  {currentCard.question}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#8396B1] pt-4 border-t border-[#DEDCEF]">
                <span>Press Space to reveal solution</span>
                <span className="hidden sm:inline">Use ← → arrow keys to navigate</span>
              </div>
            </div>

            {/* Back Face: Answer */}
            <div className="absolute inset-0 h-full w-full rounded-3xl bg-[#1D156B] text-white p-6 sm:p-10 flex flex-col justify-between rotate-y-180 backface-hidden border border-[#372E8A] shadow-glow-ink">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#CFDE22] text-[#1D156B] px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider">
                  INTUITION & SOLUTION
                </span>
                <span className="text-xs font-mono text-[#DCF090] flex items-center gap-1">
                  <RotateCw className="h-3 w-3" /> Click to flip back
                </span>
              </div>

              <div className="text-center px-2 sm:px-6 my-auto overflow-y-auto max-h-[220px]">
                <p className="text-base sm:text-xl font-medium text-[#F7F9FD] leading-relaxed whitespace-pre-wrap">
                  {currentCard.answer}
                </p>
              </div>

              <div className="text-center text-[11px] font-mono text-[#DCF090] pt-4 border-t border-[#372E8A]">
                Rate your confidence below to update study progress
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation & Mastery Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Previous / Next buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevCard}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DEDCEF] bg-white hover:bg-[#F7F9FD] text-[#1D156B] transition-all"
              aria-label="Previous card"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextCard}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DEDCEF] bg-white hover:bg-[#F7F9FD] text-[#1D156B] transition-all"
              aria-label="Next card"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Action Ratings */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => markMastery("review")}
              className="btn-weaviate-secondary text-xs sm:text-sm px-4 sm:px-5 py-2.5 gap-1.5"
            >
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Review Later</span>
            </button>
            <button
              onClick={() => markMastery("mastered")}
              className="btn-weaviate-primary text-xs sm:text-sm px-5 sm:px-6 py-2.5 gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Mastered!</span>
            </button>
          </div>
        </div>

        {/* Generator Modal */}
        {generatorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D156B]/40 backdrop-blur-sm p-4">
            <div className="card-weaviate max-w-md w-full p-6 sm:p-8 bg-white">
              <h3 className="text-xl font-bold font-display text-[#1D156B] mb-1">
                Generate AI Flashcards
              </h3>
              <p className="text-xs text-[#4C4B84] mb-6">
                Enter any study topic or textbook chapter to synthesize active-recall cards.
              </p>

              <form onSubmit={handleGenerateDeck} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-1">
                    Study Topic
                  </label>
                  <input
                    type="text"
                    required
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    placeholder="e.g. Graph Algorithms & Dijkstra Shortest Path"
                    className="w-full rounded-xl border border-[#DEDCEF] px-4 py-2.5 text-sm text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-1">
                    Number of Cards
                  </label>
                  <select
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#DEDCEF] bg-white px-4 py-2.5 text-sm font-medium text-[#1D156B] focus:outline-none"
                  >
                    <option value={5}>5 Flashcards (Quick Sprint)</option>
                    <option value={8}>8 Flashcards (Standard Review)</option>
                    <option value={12}>12 Flashcards (Comprehensive)</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setGeneratorOpen(false)}
                    className="px-4 py-2 rounded-full font-medium text-xs text-[#4C4B84] hover:bg-[#F7F9FD]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="btn-weaviate-primary text-xs px-5 py-2.5 disabled:opacity-50"
                  >
                    {isGenerating ? "Generating..." : "Generate Deck"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
