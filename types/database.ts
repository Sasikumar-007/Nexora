export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  target_exam: string;
  daily_study_goal_mins: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  created_at: string;
  updated_at: string;
}

export type ProcessingStatus = "pending" | "processing" | "completed" | "failed";

export interface DocumentRecord {
  id: string;
  user_id: string;
  title: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  page_count: number;
  processing_status: ProcessingStatus;
  extracted_text_snippet?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  user_id: string;
  chunk_index: number;
  content: string;
  page_number: number;
  token_count: number;
  similarity?: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  document_id?: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MessageCitation {
  chunk_id?: string;
  document_id?: string;
  document_title?: string;
  page_number?: number;
  snippet: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: MessageCitation[];
  created_at: string;
}

export interface FlashcardSet {
  id: string;
  user_id: string;
  document_id?: string | null;
  title: string;
  description?: string | null;
  created_at: string;
  card_count?: number;
  mastered_count?: number;
}

export interface Flashcard {
  id: string;
  set_id: string;
  question: string;
  answer: string;
  card_type: "qa" | "definition" | "formula";
  mastery_status: "new" | "review" | "mastered";
  created_at: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  document_id?: string | null;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  topic?: string | null;
  created_at: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer?: number; // hidden during live quiz testing
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  time_spent_seconds: number;
  answers_chosen: number[];
  completed_at: string;
  quiz_title?: string;
}

export interface StudyActivity {
  id: string;
  user_id: string;
  activity_type: "reading" | "chat" | "quiz" | "flashcards" | "voice";
  duration_minutes: number;
  topic?: string | null;
  created_at: string;
}

export interface RevisionPlan {
  id: string;
  user_id: string;
  title: string;
  exam_date: string;
  available_hours_per_day: number;
  created_at: string;
  tasks?: RevisionTask[];
}

export interface RevisionTask {
  id: string;
  plan_id: string;
  user_id: string;
  title: string;
  topic?: string | null;
  scheduled_date: string;
  estimated_minutes: number;
  status: "pending" | "completed";
  created_at: string;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "reminder" | "achievement" | "alert" | "info";
  is_read: boolean;
  created_at: string;
}
