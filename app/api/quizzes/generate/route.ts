import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, difficulty, count, text } = body;
    const requestedCount = count || 4;

    const sampleSchema = {
      questions: [
        {
          question: "Sample Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correct_answer: 0,
          explanation: "Detailed reason why Option A is correct.",
        },
      ],
    };

    const prompt = `Generate a ${difficulty || "medium"} difficulty multiple-choice quiz with ${requestedCount} questions on: "${topic || "Study Material"}".
Each question must have exactly 4 plausible options, a correct answer index (0 to 3), and a comprehensive step-by-step explanation.
Text excerpt: ${text ? text.slice(0, 2500) : "General exam preparation topics."}`;

    const result = await generateStructuredJson<typeof sampleSchema>({
      prompt,
      systemPrompt: "You are an expert exam question creator for university STEM courses.",
      schemaSample: sampleSchema,
    });

    const quizId = "quiz-" + Date.now();
    const questions = (result.questions || []).map((q, idx) => ({
      id: `q-${quizId}-${idx}`,
      quiz_id: quizId,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer, // stored on server/session
      explanation: q.explanation,
    }));

    return NextResponse.json({
      success: true,
      quiz: {
        id: quizId,
        title: topic ? `${topic} Quiz` : "Practice Assessment Quiz",
        difficulty: difficulty || "medium",
        topic: topic || "Study Material",
        questions: questions,
      },
    });
  } catch (err: any) {
    console.error("Quiz Generate Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
