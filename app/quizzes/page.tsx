"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Trophy,
  ChevronRight,
  Flame,
  AlertCircle,
  RefreshCw,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MOCK_QUIZZES, MOCK_DOCUMENTS } from "@/lib/demo/mock-data";
import { Quiz, QuizQuestion } from "@/types/database";
import {
  getStoredDocuments,
  ExtendedDocumentRecord,
} from "@/lib/documents/store";

function QuizzesContent() {
  const searchParams = useSearchParams();
  const urlDocId = searchParams.get("docId");

  const [documents, setDocuments] = useState<ExtendedDocumentRecord[]>(MOCK_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [activeQuiz, setActiveQuiz] = useState<Quiz>(MOCK_QUIZZES[0]);
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    MOCK_QUIZZES[0].questions || []
  );
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [genDifficulty, setGenDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load documents and inspect urlDocId
  useEffect(() => {
    const allDocs = getStoredDocuments();
    setDocuments(allDocs);

    if (urlDocId) {
      const doc = allDocs.find((d) => d.id === urlDocId);
      if (doc) {
        setSelectedDocId(doc.id);
        loadOrGenerateQuizForDoc(doc, "medium");
        return;
      }
    }

    // Default to first doc if available
    if (allDocs.length > 0) {
      setSelectedDocId(allDocs[0].id);
    }
  }, [urlDocId]);

  const loadOrGenerateQuizForDoc = async (
    doc: ExtendedDocumentRecord,
    difficulty: "easy" | "medium" | "hard" = "medium"
  ) => {
    setError(null);
    const cacheKey = `nexora_quiz_${doc.id}_${difficulty}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.questions?.length > 0) {
          setActiveQuiz(parsed);
          setQuestions(parsed.questions);
          resetQuiz();
          return;
        }
      } catch {}
    }

    // Auto-generate quiz from document content
    await generateQuizFromContent({
      topic: doc.title,
      text: doc.extracted_text || doc.extracted_text_snippet || "",
      difficulty,
      docId: doc.id,
    });
  };

  const generateQuizFromContent = async ({
    topic,
    text,
    difficulty,
    docId,
  }: {
    topic: string;
    text?: string;
    difficulty: "easy" | "medium" | "hard";
    docId?: string;
  }) => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic || "Course Material",
          difficulty,
          count: 4,
          text: text ? text.slice(0, 10000) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      if (data.quiz && data.quiz.questions?.length > 0) {
        setActiveQuiz(data.quiz);
        setQuestions(data.quiz.questions);
        resetQuiz();
        setGeneratorOpen(false);

        // Cache if docId
        if (docId) {
          try {
            localStorage.setItem(
              `nexora_quiz_${docId}_${difficulty}`,
              JSON.stringify(data.quiz)
            );
          } catch {}
        }
      }
    } catch (err: any) {
      console.error("Quiz generation error:", err);
      setError(err.message || "Failed to generate questions. Please retry.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQ = questions[currentQIndex];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQIndex] = selectedOption;
    setUserAnswers(updatedAnswers);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(
        updatedAnswers[currentQIndex + 1] !== undefined
          ? updatedAnswers[currentQIndex + 1]
          : null
      );
    } else {
      submitQuiz(updatedAnswers);
    }
  };

  const submitQuiz = async (answers: number[]) => {
    try {
      const res = await fetch("/api/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          questions,
          userAnswers: answers,
          timeSpentSeconds: 75,
        }),
      });

      const data = await res.json();
      if (data.attempt) {
        setSubmissionResult(data.attempt);
        setIsSubmitted(true);

        if (data.attempt.percentage >= 75) {
          try {
            confetti({
              particleCount: 75,
              spread: 60,
              origin: { y: 0.6 },
              colors: ["#CFDE22", "#1D156B", "#DCF090", "#FFFFFF"],
            });
          } catch {}
        }
      }
    } catch (err) {
      console.error("Quiz submission error:", err);
    }
  };

  const handleManualModalGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const doc = documents.find((d) => d.id === selectedDocId);
    await generateQuizFromContent({
      topic: genTopic || doc?.title || "Exam Preparation",
      text: doc?.extracted_text || doc?.extracted_text_snippet || undefined,
      difficulty: genDifficulty,
      docId: doc?.id,
    });
  };

  const resetQuiz = () => {
    setCurrentQIndex(0);
    setUserAnswers([]);
    setSelectedOption(null);
    setIsSubmitted(false);
    setSubmissionResult(null);
  };

  const currentDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <AppShell title="Google Gemini AI Practice Quizzes & Exam Prep">
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Document Selector & Action Header */}
        <div className="card-weaviate p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge-weaviate-lime font-mono text-[10px] font-bold">
                ✨ GEMINI 3.5 FLASH API
              </span>
              <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#CFDE22]" /> Select Study Material
              </label>
            </div>
            <select
              value={selectedDocId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedDocId(newId);
                const doc = documents.find((d) => d.id === newId);
                if (doc) loadOrGenerateQuizForDoc(doc, "medium");
              }}
              className="w-full rounded-xl border border-[#DEDCEF] bg-white p-2.5 text-xs sm:text-sm font-semibold text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.is_custom ? "📄 [Uploaded] " : "📚 "}
                  {doc.title} ({doc.page_count} pages)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentDoc) {
                  generateQuizFromContent({
                    topic: currentDoc.title,
                    text: currentDoc.extracted_text || currentDoc.extracted_text_snippet || undefined,
                    difficulty: "medium",
                    docId: currentDoc.id,
                  });
                }
              }}
              disabled={isGenerating}
              className="btn-weaviate-secondary text-xs px-4 py-2.5 gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              Generate Gemini Questions
            </button>
            <button
              onClick={() => setGeneratorOpen(true)}
              className="btn-weaviate-primary text-xs px-4 py-2.5 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" /> Custom Settings
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Banner when generating quiz */}
        {isGenerating && (
          <div className="card-weaviate p-8 bg-[#DCF090]/20 border-2 border-[#CFDE22] text-center space-y-3 animate-pulse">
            <div className="h-10 w-10 mx-auto rounded-xl bg-[#1D156B] text-[#CFDE22] flex items-center justify-center shadow-glow-ink">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
            <h3 className="font-bold font-display text-base text-[#1D156B]">
              Google Gemini is Generating Exam Questions for: {currentDoc?.title || "Your Material"}
            </h3>
            <p className="text-xs text-[#4C4B84] max-w-md mx-auto">
              Gemini 3.5 Flash is analyzing the syllabus to craft targeted multiple-choice questions with step-by-step reasoning...
            </p>
          </div>
        )}

        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-0.5 text-xs font-mono font-bold border border-[#DEDCEF] uppercase mb-1">
              <Flame className="h-3.5 w-3.5 text-[#CFDE22] fill-[#CFDE22]" /> {activeQuiz.difficulty} Assessment
            </div>
            <h2 className="text-2xl font-bold font-display text-[#1D156B] tracking-tight">
              {activeQuiz.title}
            </h2>
          </div>
        </div>

        {!isSubmitted && currentQ ? (
          /* Live Quiz Question View */
          <div className="card-weaviate p-6 sm:p-10 bg-white space-y-6">
            {/* Progress Bar & Stepper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#1D156B]">
                <span className="font-bold">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="flex items-center gap-1 text-[#8396B1]">
                  <Clock className="h-3.5 w-3.5" /> Self-paced evaluation
                </span>
              </div>
              <div className="w-full bg-[#DEDCEF] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#CFDE22] h-full rounded-full transition-all duration-300 shadow-glow-lime-sm"
                  style={{
                    width: `${((currentQIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="py-2">
              <h3 className="text-xl sm:text-2xl font-bold font-display text-[#1D156B] leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border font-sans text-xs sm:text-sm transition-all select-none flex items-center gap-3.5 ${
                      isSelected
                        ? "bg-[#1D156B] text-white border-[#1D156B] shadow-glow-ink"
                        : "bg-white text-[#1D156B] border-[#DEDCEF] hover:bg-[#F7F9FD] hover:border-[#1D156B]/30"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-mono font-bold shrink-0 ${
                        isSelected
                          ? "bg-[#CFDE22] text-[#1D156B]"
                          : "bg-[#F7F9FD] text-[#1D156B] border border-[#DEDCEF]"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Next / Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNext}
                disabled={selectedOption === null}
                className="btn-weaviate-primary text-xs px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
              >
                {currentQIndex === questions.length - 1 ? (
                  <>Submit & Score Quiz</>
                ) : (
                  <>Next Question <ChevronRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>
        ) : isSubmitted && submissionResult ? (
          /* Submission Results & Explanations Screen */
          <div className="space-y-6">
            {/* Score Banner */}
            <div className="card-weaviate p-8 bg-[#1D156B] text-white text-center shadow-glow-ink">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CFDE22] text-[#1D156B] mb-4 shadow-glow-lime-sm">
                <Trophy className="h-7 w-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                Assessment Completed
              </h3>
              <p className="text-[#A2B9C0] text-sm mt-1 font-mono">
                You scored{" "}
                <strong className="text-[#CFDE22] font-bold">
                  {submissionResult.score} of {submissionResult.total_questions}
                </strong>{" "}
                ({submissionResult.percentage}%)
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={resetQuiz}
                  className="btn-weaviate-primary text-xs px-6 py-2.5 gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Retake Quiz
                </button>
                <button
                  onClick={() => {
                    if (currentDoc) {
                      generateQuizFromContent({
                        topic: currentDoc.title,
                        text: currentDoc.extracted_text || currentDoc.extracted_text_snippet || undefined,
                        difficulty: "medium",
                        docId: currentDoc.id,
                      });
                    }
                  }}
                  className="btn-weaviate-secondary text-xs px-6 py-2.5 gap-2"
                >
                  <Sparkles className="h-4 w-4" /> Generate New Questions
                </button>
              </div>
            </div>

            {/* Detailed Question Review with Explanations */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-display text-[#1D156B]">
                Question-by-Question Diagnostic
              </h3>

              {questions.map((q, idx) => {
                const userChoice = userAnswers[idx];
                const isCorrect = userChoice === q.correct_answer;

                return (
                  <div
                    key={q.id || idx}
                    className={`card-weaviate p-6 bg-white border-2 ${
                      isCorrect ? "border-[#CFDE22]" : "border-red-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <span className="font-mono text-xs font-bold text-[#8396B1]">
                        Question {idx + 1}
                      </span>
                      {isCorrect ? (
                        <span className="badge-weaviate-lime font-mono flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Correct (+1)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 font-mono text-[11px] font-bold text-red-800">
                          <XCircle className="h-3.5 w-3.5" /> Incorrect
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold font-display text-sm sm:text-base text-[#1D156B] mb-4">
                      {q.question}
                    </h4>

                    {/* Options status */}
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt, oIdx) => {
                        const isUserSelected = userChoice === oIdx;
                        const isRightAnswer = q.correct_answer === oIdx;

                        return (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-xl text-xs font-sans flex items-center justify-between border ${
                              isRightAnswer
                                ? "bg-[#DCF090]/40 border-[#CFDE22] text-[#1D156B] font-semibold"
                                : isUserSelected
                                ? "bg-red-50 border-red-200 text-red-900"
                                : "bg-[#F7F9FD] border-[#DEDCEF] text-[#4C4B84]"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-mono font-bold">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              {opt}
                            </span>
                            {isRightAnswer && (
                              <span className="font-mono text-[10px] font-bold text-[#1D156B] uppercase">
                                Correct Answer
                              </span>
                            )}
                            {isUserSelected && !isRightAnswer && (
                              <span className="font-mono text-[10px] font-bold text-red-700 uppercase">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="bg-[#F7F9FD] p-3.5 rounded-xl border border-[#DEDCEF] text-xs text-[#4C4B84]">
                      <strong className="font-mono text-[#1D156B] block mb-1">
                        Explanation & Concept Takeaway:
                      </strong>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Generator Modal */}
        {generatorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="card-weaviate p-6 sm:p-8 bg-white max-w-md w-full space-y-4">
              <h3 className="text-xl font-bold font-display text-[#1D156B]">
                Configure AI Exam Generator
              </h3>
              <p className="text-xs text-[#4C4B84]">
                Create a targeted assessment test from your syllabus.
              </p>

              <form onSubmit={handleManualModalGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-1">
                    Topic or Focus Area
                  </label>
                  <input
                    type="text"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    placeholder={currentDoc?.title || "e.g. Thermodynamics, Big-O Notation"}
                    className="w-full rounded-xl border border-[#DEDCEF] p-3 text-xs sm:text-sm text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-1">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["easy", "medium", "hard"] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setGenDifficulty(diff)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold capitalize border transition-all ${
                          genDifficulty === diff
                            ? "bg-[#1D156B] text-white border-[#1D156B] shadow-glow-ink"
                            : "bg-white text-[#4C4B84] border-[#DEDCEF] hover:bg-[#F7F9FD]"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setGeneratorOpen(false)}
                    className="btn-weaviate-secondary text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="btn-weaviate-primary text-xs px-5 py-2 disabled:opacity-50 gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isGenerating ? "Generating..." : "Generate"}
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

export default function QuizzesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center font-mono text-xs">
          Loading Quizzes...
        </div>
      }
    >
      <QuizzesContent />
    </Suspense>
  );
}
