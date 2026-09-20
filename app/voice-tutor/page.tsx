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
  Binary,
  BookOpen,
  Send,
  RotateCcw,
  Zap,
} from "lucide-react";
import {
  getStoredDocuments,
  ExtendedDocumentRecord,
} from "@/lib/documents/store";

function VoiceTutorContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("docId") || "";

  const [documents, setDocuments] = useState<ExtendedDocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [continuousMode, setContinuousMode] = useState(false);
  const [response, setResponse] = useState(
    "Hello! I am your Google Gemini Voice Tutor, powered directly by Google Gemini 3.5 Flash. Click 'Push to Speak' or choose a syllabus PDF to ask questions and hear real-time AI spoken explanations."
  );
  const [history, setHistory] = useState<
    Array<{ speaker: "user" | "tutor"; text: string }>
  >([]);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  const continuousModeRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);

  useEffect(() => {
    continuousModeRef.current = continuousMode;
  }, [continuousMode]);

  // Load stored documents
  useEffect(() => {
    const docs = getStoredDocuments();
    setDocuments(docs);
    if (initialDocId) {
      setSelectedDocId(initialDocId);
      const found = docs.find((d) => d.id === initialDocId);
      if (found) {
        setResponse(
          `Voice agent connected to "${found.title}". Ask any question aloud or type below to hear real-time AI explanations from your notes.`
        );
      }
    }
  }, [initialDocId]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join("");
        transcriptRef.current = text;
        setTranscript(text);
      };

      rec.onend = () => {
        setIsListening(false);
        // Automatic submission on speech pause if text was captured
        const captured = transcriptRef.current.trim();
        if (captured.length > 0) {
          submitQuestion(captured);
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition notice:", e.error);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Web Speech recognition is not supported in this browser or mic permissions were denied. You can also type your question directly below to hear the voice tutor speak!"
      );
      return;
    }

    // Cancel any previous speech
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }

    transcriptRef.current = "";
    setTranscript("");

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.warn("Could not start recognition:", err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      // On stop, onend will trigger and submit transcriptRef.current
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const cleanTextForSpeech = (raw: string) => {
    return raw
      .replace(/#{1,6}\s*/g, "") // headings
      .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
      .replace(/\*([^*]+)\*/g, "$1") // italic
      .replace(/`([^`]+)`/g, "$1") // code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
      .replace(/[-*•]\s+/g, "") // bullets
      .replace(/\n+/g, ". ") // line breaks as pauses
      .trim();
  };

  const getNaturalVoice = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural English voices
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Jenny") ||
          v.name.includes("Guy") ||
          v.name.includes("Daniel") ||
          v.name.includes("David"))
    );
    return preferred || voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const readableText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(readableText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voice = getNaturalVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      // If hands-free conversational mode is active, start listening for student's next question!
      if (continuousModeRef.current) {
        setTimeout(() => {
          startListening();
        }, 600);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  };

  const submitQuestion = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    setHistory((prev) => [...prev, { speaker: "user", text: q }]);
    transcriptRef.current = "";
    setTranscript("");
    setTextInput("");
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
      setHistory((prev) => [...prev, { speaker: "tutor", text: reply }]);

      speakText(reply);
    } catch (err: any) {
      const errReply = "I encountered an issue synthesizing the voice answer. Please ask again.";
      setResponse(errReply);
      speakText(errReply);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      submitQuestion(textInput);
    }
  };

  const promptStarters = [
    {
      label: "💡 Explain main concept",
      prompt: selectedDocId
        ? `Explain the core concept in this document simply.`
        : `Explain Dijkstra's shortest path algorithm step by step.`,
    },
    {
      label: "📝 2-Sentence Summary",
      prompt: selectedDocId
        ? `Summarize the most important takeaway of this document in two concise sentences.`
        : `Summarize how quantum computing differs from classical computing in two sentences.`,
    },
    {
      label: "🎯 Key Exam Formulas",
      prompt: `What are the key formulas and definitions I must remember for my exam?`,
    },
    {
      label: "❓ Test My Understanding",
      prompt: `Ask me one conceptual question on this topic to test my understanding.`,
    },
  ];

  return (
    <AppShell title="Google Gemini Voice Tutor & Real-Time Audio">
      <div className="space-y-6 max-w-4xl mx-auto px-1 sm:px-4">
        {/* Document Context & Conversational Mode Toolbar */}
        <div className="card-weaviate p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <BookOpen className="h-4 w-4 text-[#CFDE22] shrink-0" />
            <span className="text-xs font-mono font-bold text-[#1D156B] shrink-0">
              Study Material:
            </span>
            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                const doc = documents.find((d) => d.id === e.target.value);
                if (doc) {
                  setResponse(`Voice tutor connected to "${doc.title}". Ask any question aloud to hear explanations from this syllabus.`);
                } else {
                  setResponse("Voice tutor active on all general syllabus topics. Click Push to Speak or select a quick prompt below.");
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

          {/* Real-time Hands-Free Conversation Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-medium text-[#1D156B] select-none">
              <input
                type="checkbox"
                checked={continuousMode}
                onChange={(e) => setContinuousMode(e.target.checked)}
                className="rounded border-[#DEDCEF] text-[#1D156B] focus:ring-[#CFDE22] h-4 w-4"
              />
              <span>Hands-Free Loop</span>
            </label>
            <span
              className={`badge-weaviate-lime text-[10px] font-mono ${
                continuousMode ? "!bg-[#CFDE22] !text-[#1D156B]" : "!bg-[#F7F9FD] !text-[#8396B1]"
              }`}
            >
              {continuousMode ? "CONVERSATION ON" : "PUSH-TO-TALK"}
            </span>
          </div>
        </div>

        {/* Tutor Visualizer Sphere */}
        <div className="card-weaviate p-8 sm:p-12 text-center bg-white">
          <div className="mx-auto flex flex-col items-center justify-center">
            {/* Visualizer Orb */}
            <div
              onClick={toggleListening}
              className={`relative flex h-40 w-40 sm:h-48 sm:w-48 items-center justify-center rounded-full cursor-pointer transition-all duration-300 border-2 select-none ${
                isListening
                  ? "bg-red-500 text-white animate-pulse scale-105 border-red-600 shadow-2xl ring-4 ring-red-200"
                  : isSpeaking
                  ? "bg-[#1D156B] text-[#CFDE22] border-[#372E8A] shadow-glow-lime ring-4 ring-[#DCF090]"
                  : isLoading
                  ? "bg-amber-400 text-[#1D156B] border-amber-500 animate-pulse shadow-md"
                  : "bg-[#F7F9FD] text-[#1D156B] border-[#DEDCEF] shadow-card-weaviate hover:border-[#CFDE22] hover:scale-102"
              }`}
            >
              {isListening ? (
                <div className="flex flex-col items-center gap-2">
                  <Radio className="h-14 w-14 text-white animate-spin" />
                  {/* Dancing Waveform Bars */}
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
                  {/* Dancing Waveform Bars */}
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
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Reasoning</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Mic className="h-14 w-14 text-[#1D156B]" />
                  <span className="text-[10px] font-mono font-bold uppercase text-[#8396B1]">Tap to Speak</span>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="mt-6">
              <span className="badge-weaviate-lime font-mono">
                {isListening
                  ? "LISTENING... (PAUSE OR TAP TO SUBMIT)"
                  : isSpeaking
                  ? "AI VERBALIZING SOLUTION..."
                  : isLoading
                  ? "AI SYNTHESIZING VOICE ANSWER..."
                  : "READY // TAP OR PUSH TO SPEAK"}
              </span>
            </div>

            {/* Live Real-Time Transcript Preview */}
            {transcript && (
              <div className="mt-4 p-3 bg-[#F7F9FD] rounded-xl border border-[#CFDE22] max-w-lg text-xs sm:text-sm font-mono text-[#1D156B] shadow-sm animate-fade-in">
                <span className="text-[#8396B1] font-bold mr-1.5">You said:</span>
                &ldquo;{transcript}&rdquo;
              </div>
            )}

            {/* Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={toggleListening}
                className={`btn-weaviate-primary px-7 py-3 text-sm flex items-center gap-2 shadow-md ${
                  isListening ? "!bg-red-500 !border-red-600 !text-white hover:!bg-red-600 ring-4 ring-red-100" : ""
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4" /> Stop &amp; Submit Voice
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" /> Push to Speak
                  </>
                )}
              </button>

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="btn-weaviate-secondary px-5 py-3 text-xs flex items-center gap-1.5"
                >
                  <VolumeX className="h-4 w-4 text-red-500" /> Stop Audio
                </button>
              )}
            </div>

            {/* Quick 1-Click Voice Prompt Starters */}
            <div className="mt-8 w-full max-w-xl">
              <div className="text-[11px] font-mono font-bold uppercase text-[#8396B1] mb-2.5 text-center">
                Or tap a quick question for the voice agent:
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {promptStarters.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => submitQuestion(item.prompt)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full bg-[#F7F9FD] border border-[#DEDCEF] hover:border-[#1D156B] text-[11px] font-medium text-[#1D156B] transition-all hover:bg-white shadow-sm flex items-center gap-1"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Typed Input Fallback */}
            <form
              onSubmit={handleTextSubmit}
              className="mt-6 w-full max-w-lg flex items-center gap-2 bg-[#F7F9FD] p-2 rounded-2xl border border-[#DEDCEF] shadow-sm"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Or type any question to hear audio answer..."
                className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-[#1D156B] placeholder-[#8396B1] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !textInput.trim()}
                className="btn-weaviate-primary text-xs px-4 py-2 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ask &amp; Listen</span>
              </button>
            </form>
          </div>
        </div>

        {/* Current Voice Answer Display */}
        <div className="card-weaviate p-6 sm:p-8 bg-[#F7F9FD]">
          <div className="flex items-center justify-between border-b border-[#DEDCEF] pb-3 mb-4">
            <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase text-[#8396B1]">
              <Bot className="h-4 w-4 text-[#1D156B]" /> AI Tutor Spoken Answer
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => speakText(response)}
                disabled={isSpeaking}
                className="text-xs font-mono text-[#1D156B] hover:underline flex items-center gap-1 font-bold disabled:opacity-50"
              >
                <Volume2 className="h-3.5 w-3.5" /> Replay Audio
              </button>
            </div>
          </div>
          <p className="text-sm sm:text-base font-sans text-[#1D156B] leading-relaxed whitespace-pre-wrap">
            {response}
          </p>
        </div>

        {/* Conversation History */}
        {history.length > 0 && (
          <div className="card-weaviate p-6 bg-white space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#8396B1]">
              Voice Conversation Log ({history.length})
            </h4>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs sm:text-sm ${
                    h.speaker === "user"
                      ? "bg-[#1D156B] text-white ml-6"
                      : "bg-[#F7F9FD] border border-[#DEDCEF] text-[#1D156B] mr-6"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold font-mono text-[10px] opacity-75">
                      {h.speaker === "user" ? "YOU" : "AI TUTOR"}
                    </span>
                    {h.speaker === "tutor" && (
                      <button
                        onClick={() => speakText(h.text)}
                        className="text-[10px] font-mono text-[#1D156B] hover:underline flex items-center gap-0.5"
                      >
                        <Volume2 className="h-3 w-3" /> Speak
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{h.text}</p>
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
        <AppShell title="AI Voice Tutor & Audio Learning">
          <div className="p-8 text-center text-sm font-mono text-[#8396B1]">
            Connecting voice tutor...
          </div>
        </AppShell>
      }
    >
      <VoiceTutorContent />
    </Suspense>
  );
}
