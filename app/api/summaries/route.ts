import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, format, topic } = body;

    const sampleSchema = {
      title: "Executive Chapter Summary",
      keyPoints: [
        "First foundational principle and core definition.",
        "Secondary mechanism with formula relationships.",
        "Practical examination tips and common edge cases.",
      ],
      detailedSummary:
        "Comprehensive breakdown of the subject matter detailing how foundational theorems are applied in complex problem-solving environments.",
      coreConcepts: [
        { name: "Concept Alpha", description: "First principle explanation" },
        { name: "Concept Beta", description: "Secondary applied derivation" },
      ],
    };

    const prompt = `Generate a ${format || "detailed"} academic summary for the following text or topic: "${topic || "Uploaded Course Material"}".
Focus on high-yield exam takeaways, clear conceptual definitions, and key formulas.
Input text excerpt: ${text ? text.slice(0, 3000) : "General course study material."}`;

    const result = await generateStructuredJson<typeof sampleSchema>({
      prompt,
      systemPrompt:
        "You are an academic summary generator for university and competitive exam students.",
      schemaSample: sampleSchema,
      topic: topic || "Uploaded Course Material",
      text: text || "",
    });

    return NextResponse.json({
      success: true,
      summary: result,
      format: format || "detailed",
      generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Summary Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate summary" },
      { status: 500 }
    );
  }
}
