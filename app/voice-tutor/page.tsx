"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  Radio,
  BookOpen,
  Send,
  RotateCcw,
  Pause,
  Play,
  Globe,
  CheckCircle2,
  Sliders,
  FileText,
  Clock,
  MessageSquareQuote,
} from "lucide-react";
import {
  getStoredDocuments,
  ExtendedDocumentRecord,
} from "@/lib/documents/store";

const LANGUAGE_OPTIONS = [
  { code: "en-US", label: "English (US)" },
  { code: "en-IN", label: "English (India)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "en-CA", label: "English (Canada)" },
];

function VoiceTutorContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("docId") || "";

  const [documents, setDocuments] = useState<ExtendedDocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speakingSeconds, setSpeakingSeconds] = useState(0);
  const [speechLanguage, setSpeechLanguage] = useState("en-US");
  const [speechRate, setSpeechRate] = useState(0.95);
  const [autoSendOnLongPause, setAutoSendOnLongPause] = useState(false);
  const [response, setResponse] = useState(
    "Hello! I am your Google Gemini Voice AI Tutor. You can now speak as long and as much as you want without being cut off. Choose a study syllabus or ask any academic question aloud, then click 'Done Speaking — Ask Gemini' to hear a clear, step-by-step spoken explanation."
  );
  const [citations, setCitations] = useState<any[]>([]);
  const [history, setHistory] = useState<
    Array<{ speaker: "user" | "tutor"; text: string; time: string }>
  >([]);

  // Refs for speech recognition loop
  const recognitionRef = useRef<any>(null);
  const isListeningSessionRef = useRef<boolean>(false);
  const finalTranscriptRef = useRef<string>("");
  const interimTranscriptRef = useRef<string>("");
  const timerIntervalRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const autoSendRef = useRef<boolean>(false);

  useEffect(() => {
    autoSendRef.current = autoSendOnLongPause;
  }, [autoSendOnLongPause]);

  // Load stored documents
  useEffect(() => {
    const docs = getStoredDocuments();
    setDocuments(docs);
    if (initialDocId) {
      setSelectedDocId(initialDocId);
      const found = docs.find((d) => d.id === initialDocId);
      if (found) {
        setResponse(
          `Voice agent connected to syllabus document: "${found.title}". Ask any question aloud at your own pace to receive grounded, step-by-step explanations.`
        );
      }
    }
  }, [initialDocId]);

  // Speech Recognition setup with automatic continuous restart loop
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = speechLanguage;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscriptRef.current += (finalTranscriptRef.current ? " " : "") + item[0].transcript.trim();
        } else {
          interim += item[0].transcript + " ";
        }
      }
      interimTranscriptRef.current = interim;
      const combined = (finalTranscriptRef.current + " " + interim).trim();
      setTranscript(combined);

      // Optional auto-send after long pause (8 seconds) if enabled by user
      if (autoSendRef.current) {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (isListeningSessionRef.current && finalTranscriptRef.current.trim().length > 0) {
            stopListeningAndSubmit();
          }
        }, 8000);
      }
    };

    rec.onerror = (e: any) => {
      // In case of "no-speech", browsers occasionally emit this.
      // If the user's speaking session is still active, we don't abort!
      console.warn("Speech recognition event:", e.error);
      if (e.error === "no-speech" && isListeningSessionRef.current) {
        // Continue listening
        return;
      }
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        isListeningSessionRef.current = false;
        setIsListening(false);
        alert("Microphone access was denied. Please allow microphone permissions in your browser to speak with the Voice Tutor.");
      }
    };

    rec.onend = () => {
      // CRITICAL FIX: If the user's speaking session is still active, browsers
      // (like Chrome/Edge) automatically end after short speech chunks.
      // We automatically restart so the user can speak as much and as long as they want!
      if (isListeningSessionRef.current) {
        try {
          rec.start();
        } catch (err) {
          // Wait briefly and try restart
          setTimeout(() => {
            if (isListeningSessionRef.current) {
              try { rec.start(); } catch (e) {}
            }
          }, 200);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;

    return () => {
      isListeningSessionRef.current = false;
      try {
        rec.stop();
      } catch (e) {}
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechLanguage]);

  // Start listening session
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Web Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or type your question below to hear the voice tutor speak!"
      );
      return;
    }

    // Stop ongoing speech playback
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }

    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    setTranscript("");
    setSpeakingSeconds(0);
    isListeningSessionRef.current = true;

    // Start timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setSpeakingSeconds((s) => s + 1);
    }, 1000);

    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (err) {
      console.warn("Recognition start info:", err);
    }
  };

  // Stop listening and immediately send question to Gemini
  const stopListeningAndSubmit = () => {
    isListeningSessionRef.current = false;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    setIsListening(false);

    const question = (finalTranscriptRef.current + " " + interimTranscriptRef.current).trim();
    if (question.length > 0) {
      submitQuestion(question);
    }
  };

  // Cancel listening without submitting
  const cancelListening = () => {
    isListeningSessionRef.current = false;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    setIsListening(false);
    setSpeakingSeconds(0);
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    setTranscript("");
  };

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListeningAndSubmit();
    } else {
      startListening();
    }
  };

  // Clean raw text before feeding to SpeechSynthesis
  const cleanTextForSpeech = (raw: string) => {
    return raw
      .replace(/#{1,6}\s*/g, "") // headings
      .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
      .replace(/\*([^*]+)\*/g, "$1") // italic
      .replace(/`([^`]+)`/g, "$1") // inline code
      .replace(/```[\s\S]*?```/g, "") // code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
      .replace(/[-*•]\s+/g, "") // bullets
      .replace(/\n\s*\n/g, ". ") // multiple newlines
      .replace(/\n/g, ", ") // single newlines
      .trim();
  };

  // Pick best available natural voice
  const getNaturalVoice = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = speechLanguage.slice(0, 2);

    const preferred = voices.find(
      (v) =>
        v.lang.startsWith(langPrefix) &&
        (v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Neural") ||
          v.name.includes("Samantha") ||
          v.name.includes("Jenny") ||
          v.name.includes("Guy") ||
          v.name.includes("Ravi") ||
          v.name.includes("David"))
    );
    return preferred || voices.find((v) => v.lang.startsWith(langPrefix)) || voices[0] || null;
  };

  // Speak text using SpeechSynthesis
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsPaused(false);

    const readableText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(readableText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    const voice = getNaturalVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Pause / Resume speech
  const togglePauseSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // Stop speech playback
  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  // Submit question to Gemini AI
  const submitQuestion = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setHistory((prev) => [...prev, { speaker: "user", text: q, time: timeString }]);
    setTranscript("");
    setIsLoading(true);

    try {
      const selectedDoc = documents.find((d) => d.id === selectedDocId);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }],
          mode: selectedDoc ? "rag" : "general",
          documentId: selectedDoc?.id,
          documentTitle: selectedDoc?.title,
          documentText: selectedDoc?.extracted_text || selectedDoc?.extracted_text_snippet,
          isVoice: true,
        }),
      });

      const data = await res.json();
      const reply = data.content || "I have formulated an academic explanation for your query.";
      setResponse(reply);
      if (data.citations) {
        setCitations(data.citations);
      } else {
        setCitations([]);
      }
      setHistory((prev) => [
        ...prev,
        { speaker: "tutor", text: reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);

      speakText(reply);
    } catch (err: any) {
      const errReply = "I encountered an issue synthesizing the voice answer. Please check your network connection and ask again.";
      setResponse(errReply);
      speakText(errReply);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const promptStarters = [
    {
      label: "💡 Explain Core Intuition",
      prompt: selectedDocId
        ? `Explain the main concept in this document simply with a clear analogy.`
        : `Explain Dijkstra's shortest path algorithm step by step with an intuitive analogy.`,
    },
    {
      label: "📝 3-Sentence Summary",
      prompt: selectedDocId
        ? `Summarize the most important takeaway of this syllabus document in three concise sentences.`
        : `Summarize the difference between synchronous and asynchronous programming in three sentences.`,
    },
    {
      label: "🎯 Key Exam Points",
      prompt: `What are the top 3 exam questions and formulas examiners test most on this topic?`,
    },
    {
      label: "❓ Quiz My Understanding",
      prompt: `Ask me one conceptual challenge question on this topic to test my understanding.`,
    },
  ];

  return (
    <AppShell title="Google Gemini Voice AI Tutor">
      <div className="space-y-6 max-w-4xl mx-auto px-1 sm:px-4">
        {/* Document Context & Settings Toolbar */}
        <div className="card-weaviate p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#DEDCEF]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <BookOpen className="h-4 w-4 text-[#CFDE22] shrink-0" />
            <span className="text-xs font-mono font-bold text-[#1D156B] shrink-0">
              Syllabus PDF:
            </span>
            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                const doc = documents.find((d) => d.id === e.target.value);
                if (doc) {
                  setResponse(`Voice AI Tutor connected to "${doc.title}". Ask any question aloud to hear explanations grounded directly in this syllabus.`);
                } else {
                  setResponse("Voice AI Tutor active on all academic syllabus topics. Speak as long as you'd like or select a starter prompt below.");
                }
              }}
              className="w-full sm:w-auto rounded-xl border border-[#DEDCEF] bg-white px-3 py-1.5 text-xs font-mono text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
            >
              <option value="">General Academic Syllabus (All Topics)</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  📄 {d.title} ({d.page_count}p)
                </option>
              ))}
            </select>
          </div>

          {/* Accent / Speech Recognition Language Selection */}
          <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#8396B1]">
              <Globe className="h-3.5 w-3.5 text-[#1D156B]" />
              <select
                value={speechLanguage}
                onChange={(e) => setSpeechLanguage(e.target.value)}
                className="rounded-lg border border-[#DEDCEF] bg-[#F7F9FD] px-2 py-1 text-[11px] font-mono text-[#1D156B] focus:outline-none"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional 8s silence auto-send toggle */}
            <label className="flex items-center gap-1.5 text-xs font-mono text-[#1D156B] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSendOnLongPause}
                onChange={(e) => setAutoSendOnLongPause(e.target.checked)}
                className="rounded border-[#DEDCEF] text-[#1D156B] focus:ring-[#CFDE22] h-3.5 w-3.5"
              />
              <span className="text-[11px] text-[#4C4B84]">Auto-send on 8s pause</span>
            </label>
          </div>
        </div>

        {/* Visualizer & Speech Orb */}
        <div className="card-weaviate p-8 sm:p-12 text-center bg-white border border-[#DEDCEF] shadow-sm">
          <div className="mx-auto flex flex-col items-center justify-center">
            {/* Visualizer Orb */}
            <div
              onClick={toggleListening}
              className={`relative flex h-40 w-40 sm:h-48 sm:w-48 items-center justify-center rounded-full cursor-pointer transition-all duration-300 border-2 select-none ${
                isListening
                  ? "bg-red-500 text-white animate-pulse scale-105 border-red-600 shadow-2xl ring-8 ring-red-100"
                  : isSpeaking
                  ? "bg-[#1D156B] text-[#CFDE22] border-[#372E8A] shadow-glow-lime ring-8 ring-[#DCF090]"
                  : isLoading
                  ? "bg-amber-400 text-[#1D156B] border-amber-500 animate-pulse shadow-md"
                  : "bg-[#F7F9FD] text-[#1D156B] border-[#DEDCEF] shadow-card-weaviate hover:border-[#CFDE22] hover:scale-102"
              }`}
            >
              {isListening ? (
                <div className="flex flex-col items-center gap-2">
                  <Radio className="h-12 w-12 text-white animate-spin" />
                  <span className="text-xs font-mono font-bold tracking-wider">
                    {formatSeconds(speakingSeconds)}
                  </span>
                  {/* Dynamic Audio Equalizer Bars */}
                  <div className="flex items-center gap-1 h-5">
                    <span className="w-1.5 bg-white rounded-full animate-bounce h-4" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 bg-white rounded-full animate-bounce h-6" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: "300ms" }} />
                    <span className="w-1.5 bg-white rounded-full animate-bounce h-5" style={{ animationDelay: "450ms" }} />
                  </div>
                </div>
              ) : isSpeaking ? (
                <div className="flex flex-col items-center gap-2">
                  <Volume2 className="h-14 w-14 text-[#CFDE22] animate-bounce" />
                  {/* Dynamic Equalizer Bars */}
                  <div className="flex items-center gap-1 h-5">
                    <span className="w-1.5 bg-[#CFDE22] rounded-full animate-bounce h-5" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 bg-[#CFDE22] rounded-full animate-bounce h-7" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 bg-[#CFDE22] rounded-full animate-bounce h-4" style={{ animationDelay: "300ms" }} />
                    <span className="w-1.5 bg-[#CFDE22] rounded-full animate-bounce h-6" style={{ animationDelay: "450ms" }} />
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Sparkles className="h-12 w-12 text-[#1D156B] animate-spin" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Gemini Thinking</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Mic className="h-14 w-14 text-[#1D156B]" />
                  <span className="text-[11px] font-mono font-bold uppercase text-[#8396B1]">Push to Speak</span>
                </div>
              )}
            </div>

            {/* Status Banner */}
            <div className="mt-6">
              <span className={`badge-weaviate-lime font-mono text-xs px-3.5 py-1 ${
                isListening ? "!bg-red-100 !text-red-700 !border-red-300" : ""
              }`}>
                {isListening
                  ? `🎙️ LISTENING (${formatSeconds(speakingSeconds)}) — SPEAK AS MUCH AS YOU WANT WITHOUT CUTOFF`
                  : isSpeaking
                  ? "GEMINI SPEAKING DETAILED ACADEMIC EXPLANATION..."
                  : isLoading
                  ? "GEMINI ANALYZING QUESTION & REASONING..."
                  : "READY • CLICK TO SPEAK AS MUCH AS YOU WANT"}
              </span>
            </div>

            {/* Active Real-Time Live Transcript Preview */}
            {isListening && (
              <div className="mt-4 w-full max-w-xl text-left bg-[#F7F9FD] p-4 rounded-2xl border-2 border-red-300 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-red-600 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    Live Voice Capture
                  </span>
                  <span>{formatSeconds(speakingSeconds)}</span>
                </div>
                <div className="text-sm font-sans text-[#1D156B] min-h-[48px] whitespace-pre-wrap leading-relaxed">
                  {transcript ? transcript : <span className="text-[#8396B1] italic">Speak your question clearly into the microphone...</span>}
                </div>
                <div className="mt-3 text-[11px] font-mono text-[#8396B1] flex items-center justify-between">
                  <span>Take your time. Recognition will not cut off until you click Finish.</span>
                </div>
              </div>
            )}

            {/* Primary Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {isListening ? (
                <>
                  <button
                    onClick={stopListeningAndSubmit}
                    className="btn-weaviate-primary px-8 py-3.5 text-sm flex items-center gap-2 !bg-[#1D156B] hover:!bg-[#2E248F] !text-white shadow-lg ring-4 ring-[#DCF090]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#CFDE22]" />
                    Done Speaking — Ask Gemini
                  </button>
                  <button
                    onClick={cancelListening}
                    className="px-5 py-3.5 text-xs font-bold text-[#8396B1] hover:text-red-600 rounded-full border border-[#DEDCEF] hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={startListening}
                  disabled={isLoading}
                  className="btn-weaviate-primary px-8 py-3.5 text-sm flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Mic className="h-4 w-4" /> Start Speaking
                </button>
              )}

              {/* Audio Playback Controls */}
              {isSpeaking && (
                <>
                  <button
                    onClick={togglePauseSpeech}
                    className="btn-weaviate-secondary px-5 py-3 text-xs flex items-center gap-1.5"
                  >
                    {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                  <button
                    onClick={stopSpeaking}
                    className="btn-weaviate-secondary px-5 py-3 text-xs flex items-center gap-1.5 text-red-600 hover:bg-red-50"
                  >
                    <VolumeX className="h-3.5 w-3.5" /> Stop Audio
                  </button>
                </>
              )}
            </div>

            {/* Quick 1-Click Academic Starter Prompts */}
            <div className="mt-8 w-full max-w-xl">
              <div className="text-[11px] font-mono font-bold uppercase text-[#8396B1] mb-2.5 text-center">
                Or tap a suggested academic question:
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {promptStarters.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => submitQuestion(item.prompt)}
                    disabled={isLoading || isListening}
                    className="px-3.5 py-1.5 rounded-full bg-[#F7F9FD] border border-[#DEDCEF] hover:border-[#1D156B] text-[11px] font-medium text-[#1D156B] transition-all hover:bg-white shadow-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Typed Question / Edit & Send */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (transcript.trim()) {
                  submitQuestion(transcript.trim());
                }
              }}
              className="mt-6 w-full max-w-lg flex items-center gap-2 bg-[#F7F9FD] p-2 rounded-2xl border border-[#DEDCEF] shadow-sm"
            >
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Or type/edit any academic question here..."
                className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-[#1D156B] placeholder-[#8396B1] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !transcript.trim()}
                className="btn-weaviate-primary text-xs px-4 py-2 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Ask &amp; Listen</span>
              </button>
            </form>
          </div>
        </div>

        {/* Current Spoken Answer Display */}
        <div className="card-weaviate p-6 sm:p-8 bg-[#F7F9FD] border border-[#DEDCEF]">
          <div className="flex items-center justify-between border-b border-[#DEDCEF] pb-3 mb-4">
            <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase text-[#1D156B]">
              <Bot className="h-4 w-4 text-[#1D156B]" /> Gemini AI Spoken Explanation
            </div>
            <div className="flex items-center gap-3">
              {/* Playback speed toggle */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-[#8396B1]">
                <span>Speed:</span>
                {[0.85, 0.95, 1.1].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setSpeechRate(rate);
                      if (isSpeaking) {
                        speakText(response);
                      }
                    }}
                    className={`px-2 py-0.5 rounded border text-[10px] ${
                      speechRate === rate
                        ? "bg-[#1D156B] text-white border-[#1D156B]"
                        : "bg-white text-[#1D156B] border-[#DEDCEF]"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => speakText(response)}
                disabled={isSpeaking}
                className="text-xs font-mono text-[#1D156B] hover:underline flex items-center gap-1 font-bold disabled:opacity-50"
              >
                <Volume2 className="h-3.5 w-3.5" /> Replay Spoken Audio
              </button>
            </div>
          </div>

          <p className="text-sm sm:text-base font-sans text-[#1D156B] leading-relaxed whitespace-pre-wrap">
            {response}
          </p>

          {/* Citations Grounding if from Document */}
          {citations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#DEDCEF]">
              <div className="text-[11px] font-mono font-bold uppercase text-[#8396B1] mb-2 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> Grounded in Syllabus Notes:
              </div>
              <div className="flex flex-wrap gap-2">
                {citations.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white border border-[#DEDCEF] text-[#1D156B]"
                  >
                    <BookOpen className="h-3 w-3 text-[#CFDE22]" />
                    {c.documentTitle} {c.pageNumber ? `(Page ${c.pageNumber})` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Conversation Log */}
        {history.length > 0 && (
          <div className="card-weaviate p-6 bg-white space-y-4 border border-[#DEDCEF]">
            <div className="flex items-center justify-between border-b border-[#DEDCEF] pb-3">
              <h4 className="text-xs font-mono font-bold uppercase text-[#8396B1] flex items-center gap-2">
                <MessageSquareQuote className="h-4 w-4 text-[#1D156B]" /> Voice Study Conversation ({history.length})
              </h4>
              <button
                onClick={() => setHistory([])}
                className="text-[11px] font-mono text-[#8396B1] hover:text-red-600 transition-colors"
              >
                Clear Log
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm ${
                    h.speaker === "user"
                      ? "bg-[#1D156B] text-white ml-6 shadow-sm"
                      : "bg-[#F7F9FD] border border-[#DEDCEF] text-[#1D156B] mr-6"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold font-mono text-[10px] uppercase opacity-80">
                      {h.speaker === "user" ? "YOU (VOICE)" : "GEMINI VOICE TUTOR"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono opacity-60">{h.time}</span>
                      {h.speaker === "tutor" && (
                        <button
                          onClick={() => speakText(h.text)}
                          className="text-[10px] font-mono text-[#1D156B] hover:underline flex items-center gap-0.5 font-bold"
                        >
                          <Volume2 className="h-3 w-3" /> Speak
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{h.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function VoiceTutorPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="Google Gemini Voice AI Tutor">
          <div className="p-8 text-center text-sm font-mono text-[#8396B1]">
            Connecting Google Gemini voice tutor...
          </div>
        </AppShell>
      }
    >
      <VoiceTutorContent />
    </Suspense>
  );
}
