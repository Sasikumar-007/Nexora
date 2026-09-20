# Nexora — AI Learning Companion

An AI-powered academic learning companion web application built with **Next.js**, **React**, **TypeScript**, and **Supabase**, featuring the **Brilliant-inspired Yellow & White** design system.

---

## 🚀 Key Features

### Core Features
1. **User Authentication**: Supabase Auth integration with email/password, session persistence, RLS security policies, and 1-click demo access.
2. **PDF Upload & Management**: Drag-and-drop uploader supporting study PDFs up to 20MB with processing status indicators.
3. **Pure JavaScript PDF Parsing & OCR**:
   - `pdf-parse` for fast text extraction from digital PDFs.
   - `tesseract.js` for OCR extraction on scanned or handwritten lecture notes.
4. **AI Academic Chatbot**:
   - **General AI Tutor**: Explains difficult STEM concepts, proves theorems, breaks down formulas.
   - **Document RAG Tutor**: Grounded question answering strictly over your uploaded study materials.
5. **PDF-Based RAG Pipeline**:
   - Text chunking with 40-word overlap to preserve contextual boundaries.
   - Vector embeddings (`1536-dim`).
   - Supabase `pgvector` cosine similarity search (`match_document_chunks` RPC) with page-level citations.
6. **AI Study Summaries**: Multi-format summaries (Chapter, Topic, Short, Detailed, Key Points, and Core Concepts).
7. **AI Active-Recall Flashcards**: 3D interactive flip cards (Q&A, definitions, formulas) with "Mastered" and "Need Review" tracking.
8. **AI Multiple-Choice Quiz Engine**: Custom topic/difficulty selection, self-paced timed test taking, instant server-side scoring, and step-by-step review explanations with confetti celebrations.
9. **Comprehensive Student Dashboard**: Welcome banner, active streak meter, exam readiness gauge, recent study notes, and upcoming milestones.

### Add-on Features
1. **Voice Tutor**: Web Speech API Speech-to-Text (STT) + AI RAG answers + SpeechSynthesis Text-to-Speech (TTS) verbal readout with audio wave animation.
2. **Adaptive Practice**: Performance tracking across quiz attempts to dynamically pinpoint difficult topics.
3. **AI Study Coach**: Diagnostic engine identifying weak areas and recommending target study actions.
4. **Smart Revision Planner**: Exam date countdown, daily study hour allocator, interactive calendar tasks with completion toggle.
5. **Exam Readiness Rating**: Formula combining quiz accuracy (40%), task completion (30%), streak consistency (20%), and material index (10%).
6. **Study Streak**: Daily study streak tracker with milestone achievements.
7. **Progress Analytics**: Weekly study minutes bar charts and topic mastery logs.
8. **In-App Notifications**: Study reminders, streak milestones, and task alerts.

---

## 🎨 Design System: Brilliant Yellow & White

Adheres to the Brilliant.org tactile visual learning aesthetic:
- **Palette**: Vibrant Brilliant Yellow (`#F7C325`, `#F9D25C`) on clean white backgrounds (`#FFFFFF`, `#FFFCF4`) with deep obsidian ink (`#140404`).
- **Tactile Components**: Bold borders (`border-2 border-[#140404]`), rounded pill buttons, 3D flip cards, and tactile push shadows (`shadow-[0_4px_0_0_#140404]`).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth + Supabase Storage + pgvector
- **PDF Extraction**: `pdf-parse` (Pure JavaScript / Node.js)
- **OCR Engine**: `tesseract.js` (Pure JavaScript)
- **Icons**: Lucide React
- **Animations**: `canvas-confetti`

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm 9+

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Set your Supabase and AI provider credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

AI_API_KEY=your-openai-or-gemini-key
AI_API_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```
*(Note: If no API keys are provided, Nexora operates in full interactive demo simulation mode so you can test all views immediately).*

### 4. Database Setup (Supabase)
Run the migration in your Supabase SQL Editor:
- Navigate to `supabase/migrations/20260920000000_init_schema.sql`
- Run the SQL script to create all 14 tables, RLS policies, vector similarity search functions, and the `materials` storage bucket.

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run Next.js build verification:
```bash
npm run build
```
Verify:
1. **Landing Page**: [http://localhost:3000/](http://localhost:3000/)
2. **Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
3. **Materials**: [http://localhost:3000/materials](http://localhost:3000/materials) (Upload PDF or view chunks)
4. **AI Chat & RAG**: [http://localhost:3000/chat](http://localhost:3000/chat) (Test general & document RAG modes)
5. **Summaries**: [http://localhost:3000/summaries](http://localhost:3000/summaries) (Multi-format summaries)
6. **Flashcards**: [http://localhost:3000/flashcards](http://localhost:3000/flashcards) (3D flip cards)
7. **Quizzes**: [http://localhost:3000/quizzes](http://localhost:3000/quizzes) (Timed MCQ test with scoring)
8. **Voice Tutor**: [http://localhost:3000/voice-tutor](http://localhost:3000/voice-tutor) (Push-to-talk STT & TTS)
9. **Planner**: [http://localhost:3000/planner](http://localhost:3000/planner) (Revision schedule)
10. **Progress**: [http://localhost:3000/progress](http://localhost:3000/progress) (Readiness rating)
