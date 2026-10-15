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

    const cleanTopic = (topic || "Academic Course Material").replace(/\.[^/.]+$/, "").trim();

    const prompt = `You are a distinguished university professor and academic paper setter. Generate an authoritative, in-depth academic summary and rigorous Exam Preparation Blueprint for: "${cleanTopic}".
Format style: ${format || "detailed"}.

EXAM POINT OF VIEW CRITERIA:
1. IDENTIFY 3 TO 4 DISTINCT CORE CONCEPTS:
   Extract real foundational concepts (e.g. Asymptotic Analysis, Search Trees, Dynamic Programming Optimality). Do NOT use generic words like "Overview" or "Comprehensive".
2. FOR EACH CORE CONCEPT PROVIDE:
   • Accurate 1-paragraph theoretical definition.
   • 2 MARKS EXAM VIEW: An authentic university 2-mark question, a crisp definitive answer with exact formulas/conditions, and mandatory keywords evaluators look for to award full 2/2 marks.
   • 16 MARKS EXAM VIEW: A complete university 16-mark essay question, structured section outline (1. Intro, 2. Architecture & Working Mechanism, 3. Step-by-Step Derivation, 4. Trade-offs, 5. Scoring Blueprint), in-depth structured model answer, ASCII/Markdown diagram or formula block, and exact scoring tips.

Source Syllabus Context:
${text && text.trim().length > 30 ? text.slice(0, 5000) : `Standard university curriculum and exam syllabus for ${cleanTopic}.`}`;

    const result = await generateStructuredJson<typeof sampleSchema>({
      prompt,
      systemPrompt:
        "You are an expert university professor and exam paper setter. Provide high-yield academic summaries with rigorous 2-Marks and 16-Marks exam views.",
      schemaSample: sampleSchema,
      topic: cleanTopic,
      text: text || "",
      model: process.env.AI_MODEL || "gemini-3.5-flash-lite",
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
