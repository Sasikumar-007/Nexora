import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quizId, questions, userAnswers, timeSpentSeconds } = body as {
      quizId: string;
      questions: Array<{
        id: string;
        question: string;
        options: string[];
        correct_answer: number;
        explanation: string;
      }>;
      userAnswers: number[];
      timeSpentSeconds: number;
    };

    if (!questions || !userAnswers) {
      return NextResponse.json(
        { error: "Questions and answers are required" },
        { status: 400 }
      );
    }

    let correctCount = 0;
    const review = questions.map((q, idx) => {
      const selected = userAnswers[idx];
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        selectedAnswer: selected,
        correctAnswer: q.correct_answer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = correctCount;
    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);

    const attempt = {
      id: "attempt-" + Date.now(),
      quizId,
      score,
      total_questions: total,
      percentage,
      timeSpentSeconds: timeSpentSeconds || 60,
      completed_at: new Date().toISOString(),
      review,
    };

    return NextResponse.json({
      success: true,
      attempt,
    });
  } catch (err: any) {
    console.error("Quiz Submit Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
