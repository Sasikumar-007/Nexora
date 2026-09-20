"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

export default function VoiceTutorPage() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState(
    "Hello! I am your AI Voice Tutor. Click the button below and speak your question aloud. I will listen, search your uploaded study PDFs, and explain the answer to you step-by-step."
  );
  const [history, setHistory] = useState<
    Array<{ speaker: "user" | "tutor"; text: string }>
  >([]);

  const recognitionRef = useRef<any>(null);

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
        setTranscript(text);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Web Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!transcript.trim()) return;

    const question = transcript;
    setHistory((prev) => [...prev, { speaker: "user", text: question }]);
    setTranscript("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: question }],
          mode: "general",
        }),
      });

      const data = await res.json();
      const reply = data.content || "I formulated a solution based on your syllabus.";
      setResponse(reply);
      setHistory((prev) => [...prev, { speaker: "tutor", text: reply }]);

      speakText(reply);
    } catch (err) {
      const errReply = "I encountered an error formulating the answer. Please try again.";
      setResponse(errReply);
      speakText(errReply);
    }
  };

  return (
    <AppShell title="AI Voice Tutor & Audio Learning">
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Tutor Visualizer Sphere */}
        <div className="card-weaviate p-8 sm:p-12 text-center bg-white">
          <div className="mx-auto flex flex-col items-center justify-center">
            {/* Visualizer Orb */}
            <div
              className={`relative flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center rounded-full transition-all duration-300 border ${
                isListening
                  ? "bg-red-500 text-white animate-pulse scale-105 border-red-600 shadow-lg"
                  : isSpeaking
                  ? "bg-[#1D156B] text-[#CFDE22] animate-bounce border-[#372E8A] shadow-glow-lime"
                  : "bg-[#F7F9FD] text-[#1D156B] border-[#DEDCEF] shadow-card-weaviate"
              }`}
            >
              {isListening ? (
                <Radio className="h-14 w-14 text-white animate-spin" />
              ) : isSpeaking ? (
                <Volume2 className="h-14 w-14 text-[#CFDE22]" />
              ) : (
                <Mic className="h-14 w-14 text-[#1D156B]" />
              )}
            </div>

            <div className="mt-6">
              <span className="badge-weaviate-lime font-mono">
                {isListening ? "LISTENING TO YOUR SPEECH..." : isSpeaking ? "AUDIO VERBALIZING..." : "STANDBY // READY TO SPEAK"}
              </span>
            </div>

            {/* Transcript Preview */}
            {transcript && (
              <div className="mt-4 p-3 bg-[#F7F9FD] rounded-xl border border-[#DEDCEF] max-w-lg text-xs sm:text-sm font-mono text-[#1D156B]">
                &ldquo;{transcript}&rdquo;
              </div>
            )}

            {/* Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={toggleListening}
                className={`btn-weaviate-primary px-7 py-3 text-sm flex items-center gap-2 ${
                  isListening ? "!bg-red-500 !border-red-600 !text-white hover:!bg-red-600" : ""
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4" /> Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" /> Push to Speak
                  </>
                )}
              </button>

              {transcript && (
                <button
                  onClick={handleAskQuestion}
                  className="btn-weaviate-dark px-6 py-3 text-xs sm:text-sm gap-1.5"
                >
                  <Sparkles className="h-4 w-4 text-[#CFDE22]" /> Send Query
                </button>
              )}

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="btn-weaviate-secondary px-5 py-3 text-xs"
                >
                  <VolumeX className="h-4 w-4" /> Stop Audio
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Current Voice Answer Display */}
        <div className="card-weaviate p-6 sm:p-8 bg-[#F7F9FD]">
          <div className="flex items-center justify-between border-b border-[#DEDCEF] pb-3 mb-4">
            <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase text-[#8396B1]">
              <Bot className="h-4 w-4 text-[#1D156B]" /> AI Tutor Verbal Answer
            </div>
            <button
              onClick={() => speakText(response)}
              className="text-xs font-mono text-[#1D156B] hover:underline flex items-center gap-1 font-bold"
            >
              <Volume2 className="h-3.5 w-3.5" /> Replay Voice
            </button>
          </div>
          <p className="text-xs sm:text-sm font-sans text-[#1D156B] leading-relaxed whitespace-pre-wrap">
            {response}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
