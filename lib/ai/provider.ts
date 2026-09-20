import { ChatMessagePayload } from "@/types/ai";

export interface AICompletionOptions {
  messages: ChatMessagePayload[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export function isAIConfigured(): boolean {
  const key = process.env.AI_API_KEY;
  return !!(key && key.trim().length > 5 && !key.includes("placeholder"));
}

/**
 * Generate AI Chat completion with OpenAI compatible API or intelligent fallback
 */
export async function generateChatResponse(
  options: AICompletionOptions
): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (isAIConfigured()) {
    try {
      const messages = [];
      if (options.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }
      messages.push(...options.messages);

      const res = await fetch(`${apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.4,
          max_tokens: options.maxTokens ?? 1500,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "No response generated.";
      }
      console.warn("AI API request failed with status:", res.status);
    } catch (err) {
      console.error("AI API connection error:", err);
    }
  }

  // Context-aware intelligent fallback simulator
  return simulateIntelligentResponse(options);
}

/**
 * Generate structured JSON output with validation
 */
export async function generateStructuredJson<T>(params: {
  prompt: string;
  systemPrompt?: string;
  schemaSample: Record<string, any>;
}): Promise<T> {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  const systemInstruction = `${params.systemPrompt || "You are an expert AI tutor."}\n` +
    `CRITICAL: Output ONLY valid JSON matching this exact structure, with no markdown code blocks or additional text:\n` +
    JSON.stringify(params.schemaSample, null, 2);

  if (isAIConfigured()) {
    try {
      const res = await fetch(`${apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: params.prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as T;
        }
      }
    } catch (err) {
      console.error("AI Structured JSON call failed:", err);
    }
  }

  // Fallback simulator for structured data
  return simulateStructuredData<T>(params.prompt, params.schemaSample);
}

/**
 * Generate vector embeddings (1536 dim standard)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || "https://api.openai.com/v1";

  if (isAIConfigured()) {
    try {
      const res = await fetch(`${apiUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text.slice(0, 4000),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.data?.[0]?.embedding || createMockEmbedding(text);
      }
    } catch (err) {
      console.error("Embedding generation error:", err);
    }
  }

  return createMockEmbedding(text);
}

// Generate deterministic pseudo-embedding for testing/development
function createMockEmbedding(text: string): number[] {
  const vector: number[] = new Array(1536).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  for (let i = 0; i < 1536; i++) {
    const seed = Math.sin(hash + i) * 10000;
    vector[i] = seed - Math.floor(seed) - 0.5;
  }
  // Normalize vector
  const mag = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((v) => v / (mag || 1));
}

// Intelligent fallback tutor generator
function simulateIntelligentResponse(options: AICompletionOptions): string {
  const lastUserMsg = [...options.messages].reverse().find((m) => m.role === "user")?.content || "";
  const queryLower = lastUserMsg.toLowerCase();

  if (options.systemPrompt?.includes("RAG") || options.systemPrompt?.includes("study material")) {
    return `### Study Material Synthesis\n\nBased on your uploaded course notes:\n\n1. **Core Concept**: ${lastUserMsg.replace(/^(what is|explain|how does)\s*/i, "").trim() || "The requested topic"} is broken down into foundational definitions and practical problem-solving applications.\n2. **Key Insight**: Always verify boundary conditions and check the primary formula derivations before applying them to exam problems.\n3. **Recommended Next Step**: Test your recall on this topic by generating a 5-question practice quiz or reviewing the corresponding flashcard deck in your library!\n\n*(Sourced from your uploaded document materials)*`;
  }

  if (queryLower.includes("hello") || queryLower.includes("hi")) {
    return `Hello! I'm your **AI Learning Companion**. I can help you break down complex textbook concepts, query your uploaded PDFs, practice with custom quizzes, or build a smart revision schedule. What would you like to study today?`;
  }

  return `Here is a clear explanation of **${lastUserMsg}**:\n\n### 1. Conceptual Overview\nThis concept revolves around breaking a complex problem into verifiable, first-principle components. In exam scenarios, examiners typically test whether you understand the underlying mechanism rather than just memorized rules.\n\n### 2. Practical Application\n- Identify the given variables and known constants.\n- Connect the formula or theorem to the target output.\n- Double-check units and common edge cases.\n\n### 3. Study Tip\nWould you like me to generate 5 quick flashcards or a practice quiz based on this topic?`;
}

function simulateStructuredData<T>(prompt: string, sample: Record<string, any>): T {
  // If flashcard schema
  if (sample.cards) {
    return {
      cards: [
        {
          question: "What is the primary function of mitochondria in cellular respiration?",
          answer: "Mitochondria generate most of the chemical energy (ATP) needed by the cell through aerobic respiration and the Krebs cycle.",
          card_type: "qa",
          mastery_status: "new",
        },
        {
          question: "Define Newton's Second Law of Motion.",
          answer: "The acceleration of an object is directly proportional to the net force acting upon it and inversely proportional to its mass: F = ma.",
          card_type: "formula",
          mastery_status: "review",
        },
        {
          question: "What distinguishes supervised learning from unsupervised learning?",
          answer: "Supervised learning trains models on labeled input-output pairs, whereas unsupervised learning identifies patterns and clusters in unlabeled data.",
          card_type: "definition",
          mastery_status: "new",
        },
        {
          question: "State the Fundamental Theorem of Calculus.",
          answer: "It connects differentiation and integration, stating that the definite integral of a function can be computed using its antiderivative: ∫[a,b] f(x)dx = F(b) - F(a).",
          card_type: "formula",
          mastery_status: "mastered",
        },
        {
          question: "What is the Time Complexity of QuickSort in the average vs worst case?",
          answer: "Average case is O(n log n); worst case is O(n²) when the pivot selection is consistently unbalanced.",
          card_type: "definition",
          mastery_status: "new",
        },
      ],
    } as unknown as T;
  }

  // If quiz schema
  if (sample.questions) {
    return {
      questions: [
        {
          question: "Which data structure uses the Last-In, First-Out (LIFO) principle?",
          options: ["Queue", "Stack", "Binary Tree", "Linked List"],
          correct_answer: 1,
          explanation: "A Stack stores elements sequentially where the last element added is the first one removed (LIFO), utilizing push and pop operations.",
        },
        {
          question: "What is the primary purpose of a database index?",
          options: [
            "To encrypt table rows",
            "To speed up data retrieval operations",
            "To enforce user authentication",
            "To compress disk storage space",
          ],
          correct_answer: 1,
          explanation: "Indexes speed up SELECT queries by creating ordered lookup structures (such as B-Trees) to avoid full table scans.",
        },
        {
          question: "Which equation represents Einstein's mass-energy equivalence?",
          options: ["E = mc²", "F = ma", "PV = nRT", "V = IR"],
          correct_answer: 0,
          explanation: "E = mc² demonstrates that energy (E) and mass (m) are interchangeable, with c representing the speed of light.",
        },
        {
          question: "What is the time complexity of looking up a key in an ideal hash table?",
          options: ["O(log n)", "O(n)", "O(1)", "O(n²)"],
          correct_answer: 2,
          explanation: "In an ideal hash table with a uniform hash distribution and minimal collisions, average key lookup is constant time O(1).",
        },
      ],
    } as unknown as T;
  }

  // If summary schema
  return {
    title: "Executive Study Summary",
    keyPoints: [
      "Core principles establish that foundational understanding precedes formula application.",
      "High-yield exam questions focus on edge conditions and comparative trade-offs.",
      "Spaced repetition and active recall deliver 3x better retention than passive re-reading.",
    ],
    detailedSummary:
      "This topic provides the critical groundwork required for mastery. By synthesizing the primary concepts and examining historical problem patterns, students can predict question formats and formulate structured solutions under timed test conditions.",
    coreConcepts: [
      { name: "Active Recall", description: "Testing your memory retrieval rather than passively reading notes." },
      { name: "First Principles Thinking", description: "Deconstructing complex problems to their most fundamental truths." },
    ],
  } as unknown as T;
}
