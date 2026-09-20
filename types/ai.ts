export interface ChatMessagePayload {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SummaryRequestPayload {
  documentId?: string;
  text?: string;
  format: "chapter" | "topic" | "short" | "detailed" | "key_points" | "concepts";
}

export interface FlashcardGeneratePayload {
  documentId?: string;
  text?: string;
  count?: number;
  types?: ("qa" | "definition" | "formula")[];
  topic?: string;
}

export interface QuizGeneratePayload {
  documentId?: string;
  text?: string;
  topic?: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
}

export interface QuizSubmitPayload {
  quizId: string;
  answers: number[];
  timeSpentSeconds: number;
}

export interface VoiceTutorState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  reply: string;
  error?: string | null;
}
