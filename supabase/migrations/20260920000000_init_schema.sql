-- ==============================================================================
-- AI LEARNING COMPANION - SUPABASE INITIAL DATABASE SCHEMA MIGRATION
-- Migration: 20260920000000_init_schema.sql
-- Description: Sets up all 12+ tables, RLS policies, vector similarity search, 
-- and storage configuration.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    target_exam TEXT DEFAULT 'General Academic',
    daily_study_goal_mins INTEGER DEFAULT 60,
    current_streak INTEGER DEFAULT 1,
    longest_streak INTEGER DEFAULT 1,
    last_active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'application/pdf',
    page_count INTEGER DEFAULT 0,
    processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    extracted_text_snippet TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Document Chunks Table (With pgvector for RAG)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    page_number INTEGER DEFAULT 1,
    token_count INTEGER DEFAULT 0,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS document_chunks_doc_idx ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS document_chunks_user_idx ON public.document_chunks(user_id);

-- 5. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Flashcard Sets Table
CREATE TABLE IF NOT EXISTS public.flashcard_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Flashcards Table
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id UUID NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    card_type TEXT DEFAULT 'qa' CHECK (card_type IN ('qa', 'definition', 'formula')),
    mastery_status TEXT DEFAULT 'new' CHECK (mastery_status IN ('new', 'review', 'mastered')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    topic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Quiz Questions Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of 4 string options
    correct_answer INTEGER NOT NULL, -- Index 0-3
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    time_spent_seconds INTEGER DEFAULT 0,
    answers_chosen JSONB DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Study Activity Log Table
CREATE TABLE IF NOT EXISTS public.study_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('reading', 'chat', 'quiz', 'flashcards', 'voice')),
    duration_minutes INTEGER NOT NULL DEFAULT 5,
    topic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Revision Plans Table
CREATE TABLE IF NOT EXISTS public.revision_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    exam_date DATE NOT NULL,
    available_hours_per_day NUMERIC(4, 1) DEFAULT 2.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Revision Tasks Table
CREATE TABLE IF NOT EXISTS public.revision_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.revision_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topic TEXT,
    scheduled_date DATE NOT NULL,
    estimated_minutes INTEGER DEFAULT 45,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('reminder', 'achievement', 'alert', 'info')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can select and update their own profile
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = id);

-- Documents: users can manage their own documents
DROP POLICY IF EXISTS "Users can manage own documents" ON public.documents;
CREATE POLICY "Users can manage own documents"
    ON public.documents FOR ALL
    USING (auth.uid() = user_id);

-- Document Chunks: users can read and insert their own chunks
DROP POLICY IF EXISTS "Users can access own document chunks" ON public.document_chunks;
CREATE POLICY "Users can access own document chunks"
    ON public.document_chunks FOR ALL
    USING (auth.uid() = user_id);

-- Conversations
DROP POLICY IF EXISTS "Users can manage own conversations" ON public.conversations;
CREATE POLICY "Users can manage own conversations"
    ON public.conversations FOR ALL
    USING (auth.uid() = user_id);

-- Messages
DROP POLICY IF EXISTS "Users can manage own messages" ON public.messages;
CREATE POLICY "Users can manage own messages"
    ON public.messages FOR ALL
    USING (auth.uid() = user_id);

-- Flashcard Sets & Cards
DROP POLICY IF EXISTS "Users can manage own flashcard sets" ON public.flashcard_sets;
CREATE POLICY "Users can manage own flashcard sets"
    ON public.flashcard_sets FOR ALL
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage flashcards through sets" ON public.flashcards;
CREATE POLICY "Users can manage flashcards through sets"
    ON public.flashcards FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.flashcard_sets
            WHERE public.flashcard_sets.id = public.flashcards.set_id
            AND public.flashcard_sets.user_id = auth.uid()
        )
    );

-- Quizzes & Questions
DROP POLICY IF EXISTS "Users can manage own quizzes" ON public.quizzes;
CREATE POLICY "Users can manage own quizzes"
    ON public.quizzes FOR ALL
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read quiz questions" ON public.quiz_questions;
CREATE POLICY "Users can read quiz questions"
    ON public.quiz_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes
            WHERE public.quizzes.id = public.quiz_questions.quiz_id
            AND public.quizzes.user_id = auth.uid()
        )
    );

-- Quiz Attempts
DROP POLICY IF EXISTS "Users can manage own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can manage own quiz attempts"
    ON public.quiz_attempts FOR ALL
    USING (auth.uid() = user_id);

-- Study Activity
DROP POLICY IF EXISTS "Users can manage own study activity" ON public.study_activity;
CREATE POLICY "Users can manage own study activity"
    ON public.study_activity FOR ALL
    USING (auth.uid() = user_id);

-- Revision Plans & Tasks
DROP POLICY IF EXISTS "Users can manage own revision plans" ON public.revision_plans;
CREATE POLICY "Users can manage own revision plans"
    ON public.revision_plans FOR ALL
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own revision tasks" ON public.revision_tasks;
CREATE POLICY "Users can manage own revision tasks"
    ON public.revision_tasks FOR ALL
    USING (auth.uid() = user_id);

-- Notifications
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id);

-- ==============================================================================
-- RAG VECTOR SIMILARITY SEARCH FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.match_document_chunks(
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT,
    filter_doc_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    content TEXT,
    page_number INT,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.content,
        dc.page_number,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM public.document_chunks dc
    WHERE dc.user_id = auth.uid()
      AND (filter_doc_id IS NULL OR dc.document_id = filter_doc_id)
      AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Student User'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert a welcome notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        new.id,
        'Welcome to your AI Learning Companion!',
        'Upload your first PDF study material or start an AI tutoring chat to begin.',
        'achievement'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SUPABASE STORAGE CONFIGURATION
-- ==============================================================================
-- Create 'materials' bucket for study PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload their own files
DROP POLICY IF EXISTS "Users can upload study materials" ON storage.objects;
CREATE POLICY "Users can upload study materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'materials' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to view/download their own files
DROP POLICY IF EXISTS "Users can view own study materials" ON storage.objects;
CREATE POLICY "Users can view own study materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'materials' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete own study materials" ON storage.objects;
CREATE POLICY "Users can delete own study materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'materials' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
