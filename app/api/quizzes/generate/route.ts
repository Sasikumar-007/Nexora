import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, difficulty, count, text } = body;
    const requestedCount = Math.max(1, Math.min(30, Number(count) || 5));

    const sampleSchema = {
      questions: [
        {
          question: "Rigorous in-depth conceptual question testing underlying mechanisms, invariants, or edge cases?",
          options: [
            "Plausible detailed option A demonstrating correct conceptual principle",
            "Subtle distractor B representing common misconception",
            "Alternative distractor C with inverted boundary assumption",
            "Plausible distractor D with incorrect scaling factor",
          ],
          correct_answer: 0,
          explanation: "In-depth reasoning: Option A is correct because of [mechanism]. Options B, C, and D fail due to specific boundary conditions or theoretical principles.",
        },
      ],
    };

    const prompt = `You are a distinguished university professor designing an in-depth, rigorous conceptual multiple-choice exam with exactly ${requestedCount} questions on: "${topic || "Study Material"}".
Difficulty Level: ${difficulty || "medium"}.

STRICT EXAM QUALITY CRITERIA:
1. DEEP CONCEPTUAL FOCUS: Questions must test deep understanding, causal mechanisms, architectural trade-offs, theoretical edge cases, failure modes, and scenario problem-solving. Do NOT ask superficial trivia, recall, or simple fill-in-the-blanks.
2. ACADEMICALLY RIGOROUS OPTIONS: Provide exactly 4 distinct, plausible options. Each distractor must represent a realistic student misconception or subtle technical trap.
3. IN-DEPTH EXPLANATIONS: The explanation must thoroughly explain the core concept, why the correct answer is logically and technically valid, and why each distractor is wrong.
4. VARIETY: Each of the ${requestedCount} questions must target a distinct foundational sub-topic or principle from the material.

Source Text Context (use to ground questions deeply):
${text ? text.slice(0, 4500) : "Advanced academic syllabus principles."}`;

    const result = await generateStructuredJson<typeof sampleSchema>({
      prompt,
      systemPrompt: "You are an expert exam question creator for university STEM courses. Generate rigorous, high-yield conceptual questions.",
      schemaSample: sampleSchema,
      topic: topic || "Study Material",
      text: text || "",
      count: requestedCount,
      model: process.env.AI_MODEL || "gemini-3.6-flash",
    });

    const quizId = "quiz-" + Date.now();
    const questions = (result.questions || []).map((q, idx) => ({
      id: `q-${quizId}-${idx}`,
      quiz_id: quizId,
      question: q.question,
      options: q.options,
      correct_answer: typeof q.correct_answer === "number" ? q.correct_answer : 0,
      explanation: q.explanation,
    }));

    return NextResponse.json({
      success: true,
      quiz: {
        id: quizId,
        title: topic ? `${topic} Assessment` : "In-Depth Practice Assessment Quiz",
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
