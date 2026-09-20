import { NextRequest, NextResponse } from "next/server";
import {
  MOCK_PROFILE,
  MOCK_DOCUMENTS,
  MOCK_QUIZ_ATTEMPTS,
  MOCK_FLASHCARD_SETS,
  MOCK_REVISION_PLAN,
} from "@/lib/demo/mock-data";

export async function GET(req: NextRequest) {
  try {
    // Calculate Quiz Metrics
    const totalQuizzes = MOCK_QUIZ_ATTEMPTS.length;
    const totalCorrect = MOCK_QUIZ_ATTEMPTS.reduce((sum, a) => sum + a.score, 0);
    const totalQuestions = MOCK_QUIZ_ATTEMPTS.reduce((sum, a) => sum + a.total_questions, 0);
    const quizAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 75;

    // Flashcard Metrics
    const totalFlashcards = MOCK_FLASHCARD_SETS.reduce(
      (sum, s) => sum + (s.card_count || s.cards?.length || 0),
      0
    );
    const masteredCards = MOCK_FLASHCARD_SETS.reduce(
      (sum, s) => sum + (s.mastered_count || 0),
      0
    );

    // Revision Plan Metrics
    const totalTasks = MOCK_REVISION_PLAN.tasks.length;
    const completedTasks = MOCK_REVISION_PLAN.tasks.filter((t) => t.status === "completed").length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 50;

    // Exam Readiness Score Formula (0 - 100)
    // Quiz Accuracy (40%) + Task Completion (30%) + Streak (20%) + Materials (10%)
    const streakFactor = Math.min(100, MOCK_PROFILE.current_streak * 15);
    const docFactor = Math.min(100, MOCK_DOCUMENTS.length * 30);

    const examReadinessScore = Math.round(
      quizAccuracy * 0.4 +
      taskCompletionRate * 0.3 +
      streakFactor * 0.2 +
      docFactor * 0.1
    );

    // AI Study Coach Insights
    const coachRecommendations = [
      {
        type: "priority",
        topic: "Dynamic Programming & Graph Algorithms",
        reason: "Latest quiz attempt indicated a 15% lower accuracy on multi-step recurrence relations.",
        suggestedAction: "Generate a 5-question targeted quiz on DP Patterns.",
      },
      {
        type: "retention",
        topic: "Linear Algebra & Eigenvalues",
        reason: "Last reviewed 4 days ago. Active recall interval recommended today.",
        suggestedAction: "Run a 3-minute flashcard flip session.",
      },
      {
        type: "schedule",
        topic: "Fall Semester Exam Sprint",
        reason: "18 days remaining until target examination date.",
        suggestedAction: "Complete today's scheduled revision task on Shortest Paths.",
      },
    ];

    const weeklyActivity = [
      { day: "Mon", minutes: 45, quizzes: 1 },
      { day: "Tue", minutes: 60, quizzes: 0 },
      { day: "Wed", minutes: 90, quizzes: 2 },
      { day: "Thu", minutes: 75, quizzes: 1 },
      { day: "Fri", minutes: 80, quizzes: 1 },
      { day: "Sat", minutes: 110, quizzes: 2 },
      { day: "Sun", minutes: 70, quizzes: 1 },
    ];

    return NextResponse.json({
      profile: MOCK_PROFILE,
      examReadinessScore,
      quizAccuracy,
      totalQuizzes,
      totalFlashcards,
      masteredCards,
      completedTasks,
      totalTasks,
      documentsCount: MOCK_DOCUMENTS.length,
      coachRecommendations,
      weeklyActivity,
    });
  } catch (err: any) {
    console.error("Progress API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load progress analytics" },
      { status: 500 }
    );
  }
}
