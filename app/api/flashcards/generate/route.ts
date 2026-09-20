import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, text, count } = body;
    const requestedCount = count || 5;

    const sampleSchema = {
      cards: [
        {
          question: "Sample Question?",
          answer: "Sample Answer with precise academic definitions.",
          card_type: "qa", // "qa" | "definition" | "formula"
          mastery_status: "new",
        },
      ],
    };

    const prompt = `Create ${requestedCount} high-yield study flashcards for: "${topic || "Uploaded Course Document"}".
Mix Q&A, definitions, and key formulas.
Make sure the answers are concise, accurate, and easy to memorize.
Source text excerpt: ${text ? text.slice(0, 2500) : "Core academic curriculum."}`;

    const result = await generateStructuredJson<typeof sampleSchema>({
      prompt,
      systemPrompt: "You are a master study deck architect.",
      schemaSample: sampleSchema,
      topic: topic || "Uploaded Course Document",
      text: text || "",
    });

    const cards = (result.cards || []).map((c, i) => ({
      id: "card-" + Date.now() + "-" + i,
      question: c.question,
      answer: c.answer,
      card_type: c.card_type || "qa",
      mastery_status: c.mastery_status || "new",
      created_at: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      setId: "set-" + Date.now(),
      title: topic ? `${topic} Flashcards` : "Study Notes Flashcards",
      cards,
    });
  } catch (err: any) {
    console.error("Flashcards Generate Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
