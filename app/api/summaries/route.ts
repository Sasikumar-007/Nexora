import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, format, topic } = body;

    const sampleSchema = {
      title: "Executive Chapter Summary & Exam Master Guide",
      keyPoints: [
        "First foundational principle and core definition.",
        "Secondary mechanism with formula relationships.",
        "Practical examination tips and common edge cases.",
      ],
      detailedSummary:
        "Comprehensive breakdown of the subject matter detailing how foundational theorems are applied in complex problem-solving environments.",
      coreConcepts: [
        {
          name: "Concept Name",
          description: "First principle explanation",
          twoMarksView: {
            question: "Define Concept Name and state its primary law or significance.",
            answer: "Precise university-standard definition with mandatory keywords and governing equation.",
            keywords: ["Core Invariant", "Boundary Limit", "Exact Keyword"],
          },
          sixteenMarksView: {
            question: "Explain Concept Name in detail with architecture, step-by-step derivation, visual diagram, trade-offs, and scoring tips.",
            outline: [
              "1. Introduction & Theoretical Foundations",
              "2. Architectural / Working Mechanism",
              "3. Step-by-Step Derivation & Formulations",
              "4. Visual Diagram & Structural Flow",
              "5. Performance Trade-offs & Limitations",
              "6. Examiner Scoring Blueprint",
            ],
            structuredAnswer: "Structured comprehensive 16-mark essay covering all outline sections in detail.",
            diagramOrFormula: "System block diagram and governing formulas in ASCII/Markdown.",
            scoringAdvice: "Exact tips for students to score 16/16 marks from evaluators.",
          },
        },
      ],
      examPointOfView: {
        twoMarksQuestions: [
          {
            concept: "Concept Name",
            question: "State the law/definition for Concept Name.",
            answer: "Concise 2-mark answer with keywords and formula.",
            keyPoints: ["Accurate definition", "Governing formula"],
          },
        ],
        sixteenMarksQuestions: [
          {
            concept: "Concept Name",
            question: "Detailed 16-mark question on Concept Name.",
            outline: ["Introduction", "Working Mechanism", "Derivation", "Trade-offs", "Conclusion"],
            structuredAnswer: "Comprehensive 16-mark essay answer.",
            diagramsOrFormulas: "Block diagram and equation balance.",
            markingSchemeTips: "Marking scheme breakdown for students.",
          },
        ],
      },
    };

    const prompt = `Generate an in-depth academic summary and complete Exam Blueprint for: "${topic || "Uploaded Course Material"}".
Format requested: ${format || "detailed"}.

MANDATORY EXAM POINT OF VIEW SECTIONS:
For EACH core concept identified from the material:
1. 2 MARKS VIEW (Short / Definitive Answer):
   - Provide an actual university 2-mark question.
   - Provide a concise, high-scoring model answer with precise definitions and formulas.
   - List the essential keywords university evaluators search for when awarding 2/2 marks.
2. 16 MARKS VIEW (Comprehensive Essay / Derivation Answer):
   - Provide a full 16-mark university examination question.
   - Provide structured section outline headings.
   - Provide a comprehensive, in-depth structured essay answer (Introduction, Core Mechanism, Step-by-Step Derivation/Proof, Structural Flow, Trade-offs).
   - Provide an ASCII/markdown diagram or formula block.
   - Provide specific scoring advice to help students obtain full 16/16 marks from examiners.

Input text excerpt:
${text ? text.slice(0, 4500) : "General course study material."}`;

    const result = await generateStructuredJson<typeof sampleSchema>({
      prompt,
      systemPrompt:
        "You are an expert university professor and exam paper setter. Provide high-yield academic summaries with rigorous 2-Marks and 16-Marks exam views.",
      schemaSample: sampleSchema,
      topic: topic || "Uploaded Course Material",
      text: text || "",
      model: process.env.AI_MODEL || "gemini-3.6-flash",
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
