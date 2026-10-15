"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  Sparkles,
  Copy,
  Check,
  ListOrdered,
  AlertCircle,
  RefreshCw,
  FileText,
  BookOpen,
  GraduationCap,
  Award,
  Layers,
  ChevronRight,
  Code,
  CheckCircle2,
} from "lucide-react";
import { MOCK_DOCUMENTS } from "@/lib/demo/mock-data";
import {
  getStoredDocuments,
  ExtendedDocumentRecord,
} from "@/lib/documents/store";

export interface ConceptItem {
  name: string;
  description: string;
  twoMarksView?: {
    question: string;
    answer: string;
    keywords: string[];
  };
  sixteenMarksView?: {
    question: string;
    outline: string[];
    structuredAnswer: string;
    diagramOrFormula?: string;
    scoringAdvice?: string;
  };
}

export interface SummaryData {
  title: string;
  format: string;
  keyPoints: string[];
  detailedSummary: string;
  coreConcepts: ConceptItem[];
  examPointOfView?: {
    twoMarksQuestions: Array<{
      concept: string;
      question: string;
      answer: string;
      keyPoints: string[];
    }>;
    sixteenMarksQuestions: Array<{
      concept: string;
      question: string;
      outline: string[];
      structuredAnswer: string;
      diagramsOrFormulas?: string;
      markingSchemeTips?: string;
    }>;
  };
}

function SummariesContent() {
  const searchParams = useSearchParams();
  const urlDocId = searchParams.get("docId");

  const [documents, setDocuments] = useState<ExtendedDocumentRecord[]>(MOCK_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [summaryFormat, setSummaryFormat] = useState<
    "chapter" | "topic" | "short" | "detailed" | "key_points" | "concepts"
  >("detailed");
  const [examFilter, setExamFilter] = useState<
    "all" | "two_marks" | "sixteen_marks" | "standard"
  >("all");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [conceptActiveTab, setConceptActiveTab] = useState<Record<number, "overview" | "2marks" | "16marks">>({});
  const [error, setError] = useState<string | null>(null);

  const [summaryData, setSummaryData] = useState<SummaryData>({
    title: "Comprehensive Study Summary: Data Structures & Algorithms",
    format: "detailed",
    keyPoints: [
      "Asymptotic analysis classifies algorithm growth rates as n → ∞; worst-case Big-O guarantees safety bounds.",
      "Balanced search trees (AVL/Red-Black) maintain O(log n) performance through local rotations upon insertion/deletion.",
      "Dynamic programming reduces exponential recursive complexity to polynomial bounds via memoization and optimal substructure.",
      "Graph shortest-path problems require non-negative weights for Dijkstra's algorithm (O((V+E)log V)); Bellman-Ford accommodates negative cycles.",
    ],
    detailedSummary:
      "This document provides a systematic review of computational complexity and fundamental data structures. Core emphasis is placed on the trade-offs between memory footprints and operation latency. In typical competitive or board examinations, algorithms must be selected according to input size constraints and edge case vulnerabilities.",
    coreConcepts: [
      {
        name: "Big-O Notation",
        description: "Upper bound asymptotic runtime behavior ignoring constant scaling factors.",
        twoMarksView: {
          question: "Define Big-O Notation and state its mathematical condition.",
          answer:
            "Big-O notation f(n) = O(g(n)) formally defines an asymptotic upper bound such that there exist positive constants c and n0 satisfying 0 <= f(n) <= c*g(n) for all n >= n0. It characterizes worst-case algorithmic complexity independent of machine architecture.",
          keywords: ["Asymptotic upper bound", "Constants c and n0", "Worst-case performance"],
        },
        sixteenMarksView: {
          question:
            "Explain Asymptotic Notations in detail. Compare Big-O, Omega, and Theta with mathematical derivations, architectural growth graphs, and exam tips.",
          outline: [
            "1. Introduction to Complexity Analysis",
            "2. Mathematical Definitions (Big-O, Omega, Theta)",
            "3. Step-by-Step Formal Proof of Upper Bound",
            "4. Graphical Representation of Growth Classes",
            "5. Algorithmic Trade-offs & Common Recurrences",
            "6. Examiner Scoring Blueprint (16/16 Marks)",
          ],
          structuredAnswer: `### 1. INTRODUCTION TO COMPLEXITY ANALYSIS
Asymptotic analysis evaluates algorithmic resource consumption (temporal and spatial) as input size n grows asymptotically toward infinity. Rather than measuring machine-dependent execution seconds, it measures operational growth rates.

### 2. MATHEMATICAL FORMULATION
• Big-O (Upper Bound): f(n) = O(g(n)) iff ∃ c > 0, n0 > 0 such that 0 ≤ f(n) ≤ c·g(n) ∀ n ≥ n0.
• Big-Omega (Lower Bound): f(n) = Ω(g(n)) iff ∃ c > 0, n0 > 0 such that 0 ≤ c·g(n) ≤ f(n) ∀ n ≥ n0.
• Big-Theta (Tight Bound): f(n) = Θ(g(n)) iff f(n) = O(g(n)) AND f(n) = Ω(g(n)).

### 3. STEP-BY-STEP DERIVATION
Example: Prove 3n^2 + 5n + 7 is O(n^2).
1. For all n ≥ 1: 5n ≤ 5n^2 and 7 ≤ 7n^2.
2. Thus: 3n^2 + 5n + 7 ≤ 3n^2 + 5n^2 + 7n^2 = 15n^2.
3. Choosing c = 15 and n0 = 1, the condition 0 ≤ 3n^2 + 5n + 7 ≤ c·n^2 holds for all n ≥ n0.
4. Hence, 3n^2 + 5n + 7 = O(n^2). [Q.E.D.]

### 4. VISUAL GROWTH HIERARCHY
O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n) < O(n!)

### 5. PRACTICAL TRADE-OFFS
Sorting algorithms exhibit standard bounds: MergeSort guarantees O(n log n) worst-case time with O(n) auxiliary space; QuickSort achieves O(n log n) average time in-place (O(log n) stack) but degenerates to O(n^2) without randomized pivoting.`,
          diagramOrFormula: `Growth Hierarchy:
O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n)
Condition: 0 <= f(n) <= c*g(n) for all n >= n0`,
          scoringAdvice:
            "State the exact mathematical limits, prove the constants c and n0 clearly, and draw the curve comparison diagram for full 16 marks.",
        },
      },
      {
        name: "Memoization & DP",
        description: "Caching intermediate subproblem solutions to prevent redundant recalculation.",
        twoMarksView: {
          question: "What is Memoization? How does it differ from Tabulation?",
          answer:
            "Memoization is a top-down dynamic programming technique that caches the return values of expensive recursive function calls based on unique parameter keys. Unlike bottom-up Tabulation which iteratively computes all subproblem states, Memoization computes only the states strictly required on demand.",
          keywords: ["Top-down caching", "Overlapping subproblems", "Avoid redundant computation"],
        },
        sixteenMarksView: {
          question:
            "Discuss Dynamic Programming in detail. Formulate the Principle of Optimality, compare Top-Down vs Bottom-Up, and analyze the 0/1 Knapsack Problem with full state transitions.",
          outline: [
            "1. Foundational DP Principles & Bellman Equation",
            "2. Overlapping Subproblems vs Optimal Substructure",
            "3. Top-Down Memoization vs Bottom-Up Tabulation",
            "4. 0/1 Knapsack Formulation & Recurrence Derivation",
            "5. State Space Matrix & Complexity Analysis",
            "6. Examiner Scoring Blueprint",
          ],
          structuredAnswer: `### 1. FOUNDATIONAL DP PRINCIPLES
Dynamic Programming solves complex optimization problems by decomposing them into overlapping subproblems and applying Bellman's Principle of Optimality: an optimal policy has the property that whatever the initial state and initial decision are, the remaining decisions must constitute an optimal policy with regard to the state resulting from the first decision.

### 2. TWO MANDATORY PROPERTIES
1. Optimal Substructure: Global optimal solution is constructed directly from optimal solutions of constituent subproblems.
2. Overlapping Subproblems: The recursive formulation repeatedly revisits identical state subproblems rather than generating unique children (distinguishing DP from Divide & Conquer).

### 3. TOP-DOWN VS BOTTOM-UP
• Top-Down (Memoization): Recursive call tree preserved; table filled lazily; consumes call stack frames O(depth).
• Bottom-Up (Tabulation): Iterative table initialization; no recursion overhead; allows space optimization by retaining only the preceding row O(W).

### 4. 0/1 KNAPSACK STATE RECURRENCE
Given n items with weights w[i] and values v[i], and capacity W:
DP[i][w] = DP[i-1][w]                                    (if w[i] > w)
DP[i][w] = max(DP[i-1][w], DP[i-1][w - w[i]] + v[i])     (if w[i] <= w)

### 5. COMPLEXITY
• Time Complexity: O(n * W) pseudo-polynomial.
• Space Complexity: O(n * W) standard, optimizable to O(W).`,
          diagramOrFormula: `DP Transition Matrix:
DP[i][w] = max(DP[i-1][w], DP[i-1][w - w[i]] + v[i])
Base cases: DP[0][w] = 0, DP[i][0] = 0`,
          scoringAdvice:
            "Write the complete piecewise recurrence equation, draw the state grid with backtracking arrows, and mention pseudo-polynomial complexity for full 16/16 marks.",
        },
      },
      {
        name: "Min-Heap Invariant",
        description: "Every parent node is less than or equal to its child nodes, enabling O(1) minimum retrieval.",
        twoMarksView: {
          question: "State the Min-Heap Property and its height relationship.",
          answer:
            "In a binary Min-Heap, for every node i other than the root, Key(Parent(i)) <= Key(i). The tree is complete, guaranteeing a strictly bounded logarithmic height of h = floor(log2(n)), enabling O(log n) insertions and deletions.",
          keywords: ["Key(Parent) <= Key(Child)", "Complete binary tree", "O(log n) height bound"],
        },
        sixteenMarksView: {
          question:
            "Describe Binary Heap Architecture. Derive the Build-Heap linear time O(n) bound and analyze HeapSort with state transitions.",
          outline: [
            "1. Binary Heap Definition & Array Representation",
            "2. Heapify Operations (Sift-Up and Sift-Down)",
            "3. Mathematical Proof of O(n) Build-Heap Runtime",
            "4. HeapSort Algorithm Step-by-Step",
            "5. Priority Queue Applications & Edge Cases",
            "6. Exam Scoring Tips",
          ],
          structuredAnswer: `### 1. ARRAY REPRESENTATION
A complete binary tree is packed contiguously into an array without pointer overhead:
• Left Child(i) = 2i + 1
• Right Child(i) = 2i + 2
• Parent(i) = floor((i - 1) / 2)

### 2. HEAPIFY MECHANISM
When a root violates the invariant, Sift-Down recursively swaps the root with its smaller child until the invariant is restored. Each sift-down step requires at most O(h) comparisons.

### 3. PROOF OF O(n) BUILD-HEAP COMPLEXITY
Naive analysis suggests n * O(log n). However, most nodes reside near the leaves:
Number of nodes at height h is at most ceil(n / 2^(h+1)).
Total Work = Sigma [ (n / 2^(h+1)) * O(h) ] for h = 0 to log n.
Factor out n: (n/2) * Sigma [ h / 2^h ] <= (n/2) * 2 = O(n).
Thus, building a heap from an arbitrary array runs in strictly O(n) linear time.

### 4. HEAPSORT STAGES
1. Build Max-Heap from input array: O(n).
2. For i = n-1 down to 1:
   Swap root with A[i]; decrement heap size; Sift-Down root: O(n log n).
Total Time: O(n log n) worst-case in-place (O(1) auxiliary space).`,
          diagramOrFormula: `Array Mapping:
Index:   0   1   2   3   4   5
Keys:   [2,  5,  7, 10, 12,  9]
Tree: Root=2 -> Children: 5, 7 -> Grandchildren: 10, 12, 9`,
          scoringAdvice:
            "Show the summation derivation for O(n) Build-Heap explicitly. Evaluators award 6 marks just for the geometric series summation step.",
        },
      },
    ],
    examPointOfView: {
      twoMarksQuestions: [
        {
          concept: "Big-O Notation",
          question: "Define Big-O Notation and state its mathematical condition.",
          answer:
            "Big-O notation f(n) = O(g(n)) formally defines an asymptotic upper bound such that there exist positive constants c and n0 satisfying 0 <= f(n) <= c*g(n) for all n >= n0. It characterizes worst-case algorithmic complexity independent of machine architecture.",
          keyPoints: ["Asymptotic upper bound", "Constants c and n0", "Worst-case performance"],
        },
        {
          concept: "Memoization & DP",
          question: "What is Memoization? How does it differ from Tabulation?",
          answer:
            "Memoization is a top-down dynamic programming technique that caches the return values of expensive recursive function calls based on unique parameter keys. Unlike bottom-up Tabulation which iteratively computes all subproblem states, Memoization computes only the states strictly required on demand.",
          keyPoints: ["Top-down caching", "Overlapping subproblems", "Avoid redundant computation"],
        },
        {
          concept: "Min-Heap Invariant",
          question: "State the Min-Heap Property and its height relationship.",
          answer:
            "In a binary Min-Heap, for every node i other than the root, Key(Parent(i)) <= Key(i). The tree is complete, guaranteeing a strictly bounded logarithmic height of h = floor(log2(n)), enabling O(log n) insertions and deletions.",
          keyPoints: ["Key(Parent) <= Key(Child)", "Complete binary tree", "O(log n) height bound"],
        },
      ],
      sixteenMarksQuestions: [
        {
          concept: "Big-O Notation",
          question:
            "Explain Asymptotic Notations in detail. Compare Big-O, Omega, and Theta with mathematical derivations, architectural growth graphs, and exam tips.",
          outline: [
            "1. Introduction to Complexity Analysis",
            "2. Mathematical Definitions (Big-O, Omega, Theta)",
            "3. Step-by-Step Formal Proof of Upper Bound",
            "4. Graphical Representation of Growth Classes",
            "5. Algorithmic Trade-offs & Common Recurrences",
            "6. Examiner Scoring Blueprint",
          ],
          structuredAnswer:
            "Asymptotic analysis evaluates algorithmic resource consumption as input size n approaches infinity. Big-O provides the formal upper bound, Big-Omega provides the lower bound, and Big-Theta provides the asymptotically tight bound. Evaluators require explicit verification of constants c and n0.",
          diagramsOrFormulas:
            "O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n)\nCondition: 0 <= f(n) <= c*g(n) for all n >= n0",
          markingSchemeTips:
            "State the exact mathematical limits, prove the constants c and n0 clearly, and draw the curve comparison diagram for full 16 marks.",
        },
        {
          concept: "Memoization & DP",
          question:
            "Discuss Dynamic Programming in detail. Formulate the Principle of Optimality, compare Top-Down vs Bottom-Up, and analyze the 0/1 Knapsack Problem with full state transitions.",
          outline: [
            "1. Foundational DP Principles & Bellman Equation",
            "2. Overlapping Subproblems vs Optimal Substructure",
            "3. Top-Down Memoization vs Bottom-Up Tabulation",
            "4. 0/1 Knapsack Formulation & Recurrence Derivation",
            "5. State Space Matrix & Complexity Analysis",
          ],
          structuredAnswer:
            "Dynamic Programming solves optimization problems by breaking them into overlapping subproblems governed by Bellman's principle of optimality. Top-down memoization caches recursive results on demand, while bottom-up tabulation fills a state table iteratively.",
          diagramsOrFormulas:
            "DP[i][w] = max(DP[i-1][w], DP[i-1][w - w[i]] + v[i])\nTime Complexity: O(n*W), Space: O(W)",
          markingSchemeTips:
            "Write the complete piecewise recurrence equation, draw the state grid with backtracking arrows, and mention pseudo-polynomial complexity for full 16/16 marks.",
        },
      ],
    },
  });

  // Load documents and handle initial selection
  useEffect(() => {
    const allDocs = getStoredDocuments();
    setDocuments(allDocs);

    const targetId =
      urlDocId && allDocs.some((d) => d.id === urlDocId)
        ? urlDocId
        : allDocs[0]?.id || "";

    setSelectedDocId(targetId);

    // If a specific document was passed in URL and it's a custom uploaded document, auto-generate!
    if (targetId) {
      const doc = allDocs.find((d) => d.id === targetId);
      if (doc && (doc.is_custom || urlDocId)) {
        // Check cache first (must have 2-mark or 16-mark exam views)
        const cacheKey = `nexora_summary_${targetId}_${summaryFormat}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && (parsed.examPointOfView || parsed.coreConcepts?.[0]?.twoMarksView)) {
              setSummaryData(parsed);
              return;
            }
          } catch {}
        }
        triggerGeneration(doc, summaryFormat);
      }
    }
  }, [urlDocId]);

  const triggerGeneration = async (
    doc: ExtendedDocumentRecord,
    format: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const cleanTitle = doc.title.replace(/\.[^/.]+$/, "").trim();
      const textToUse = doc.extracted_text || doc.extracted_text_snippet || "";
      const res = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: cleanTitle,
          format: format,
          text: textToUse ? textToUse.slice(0, 6000) : "",
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate summary");
      }

      if (data.summary) {
        const newSummary: SummaryData = {
          title: data.summary.title || `${doc.title} — Summary & Exam Blueprint`,
          format: format,
          keyPoints: data.summary.keyPoints || [],
          detailedSummary: data.summary.detailedSummary || "",
          coreConcepts: data.summary.coreConcepts || [],
          examPointOfView: data.summary.examPointOfView,
        };
        setSummaryData(newSummary);

        // Cache result
        try {
          localStorage.setItem(
            `nexora_summary_${doc.id}_${format}`,
            JSON.stringify(newSummary)
          );
        } catch {}
      }
    } catch (err: any) {
      console.error("Summary generation error:", err);
      setError(err.message || "Failed to connect to AI summary service.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualGenerate = () => {
    const doc = documents.find((d) => d.id === selectedDocId);
    if (!doc) return;
    triggerGeneration(doc, summaryFormat);
  };

  const handleCopySection = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAll = () => {
    let fullText = `${summaryData.title}\n\n`;
    fullText += `=== KEY HIGH-YIELD POINTS ===\n`;
    summaryData.keyPoints.forEach((p, i) => {
      fullText += `${i + 1}. ${p}\n`;
    });
    fullText += `\n=== COMPREHENSIVE SYNTHESIS ===\n${summaryData.detailedSummary}\n\n`;

    // 2-mark questions
    const twoMarks =
      summaryData.examPointOfView?.twoMarksQuestions ||
      summaryData.coreConcepts.filter((c) => c.twoMarksView).map((c) => ({
        concept: c.name,
        question: c.twoMarksView!.question,
        answer: c.twoMarksView!.answer,
        keyPoints: c.twoMarksView!.keywords,
      }));

    if (twoMarks.length > 0) {
      fullText += `=== 2 MARKS EXAM VIEW (HIGH-YIELD SHORT ANSWERS) ===\n`;
      twoMarks.forEach((q, i) => {
        fullText += `[Q${i + 1}] (2 Marks): ${q.question}\nAnswer: ${q.answer}\nMandatory Keywords: ${q.keyPoints.join(", ")}\n\n`;
      });
    }

    // 16-mark questions
    const sixteenMarks =
      summaryData.examPointOfView?.sixteenMarksQuestions ||
      summaryData.coreConcepts.filter((c) => c.sixteenMarksView).map((c) => ({
        concept: c.name,
        question: c.sixteenMarksView!.question,
        outline: c.sixteenMarksView!.outline,
        structuredAnswer: c.sixteenMarksView!.structuredAnswer,
        diagramsOrFormulas: c.sixteenMarksView!.diagramOrFormula,
        markingSchemeTips: c.sixteenMarksView!.scoringAdvice,
      }));

    if (sixteenMarks.length > 0) {
      fullText += `=== 16 MARKS EXAM VIEW (UNIVERSITY ESSAYS & DERIVATIONS) ===\n`;
      sixteenMarks.forEach((q, i) => {
        fullText += `[Q${i + 1}] (16 Marks): ${q.question}\nOutline: ${q.outline.join(" | ")}\nStructured Answer:\n${q.structuredAnswer}\n`;
        if (q.diagramsOrFormulas) fullText += `Diagram/Formula:\n${q.diagramsOrFormulas}\n`;
        if (q.markingSchemeTips) fullText += `Scoring Blueprint: ${q.markingSchemeTips}\n`;
        fullText += `\n----------------------------------------\n\n`;
      });
    }

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentDoc = documents.find((d) => d.id === selectedDocId);

  // Extract 2-mark questions from either examPointOfView or coreConcepts
  const twoMarksList =
    summaryData.examPointOfView?.twoMarksQuestions ||
    summaryData.coreConcepts
      .filter((c) => c.twoMarksView)
      .map((c) => ({
        concept: c.name,
        question: c.twoMarksView!.question,
        answer: c.twoMarksView!.answer,
        keyPoints: c.twoMarksView!.keywords,
      }));

  // Extract 16-mark questions from either examPointOfView or coreConcepts
  const sixteenMarksList =
    summaryData.examPointOfView?.sixteenMarksQuestions ||
    summaryData.coreConcepts
      .filter((c) => c.sixteenMarksView)
      .map((c) => ({
        concept: c.name,
        question: c.sixteenMarksView!.question,
        outline: c.sixteenMarksView!.outline,
        structuredAnswer: c.sixteenMarksView!.structuredAnswer,
        diagramsOrFormulas: c.sixteenMarksView!.diagramOrFormula,
        markingSchemeTips: c.sixteenMarksView!.scoringAdvice,
      }));

  return (
    <AppShell title="Google Gemini AI Summaries & Exam Blueprint">
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Generator Controls Card */}
        <div className="card-weaviate p-6 sm:p-8 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="badge-weaviate-lime font-mono text-[11px] font-bold">
                ✨ GEMINI AI ENGINE
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1D156B]">
                Academic Summary & Exam Preparation Blueprint
              </h2>
            </div>
            {currentDoc?.is_custom && (
              <span className="badge-weaviate-lime font-mono">
                CURRENT UPLOADED PDF
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#4C4B84] mb-6">
            Synthesize chapters with Google Gemini: extract high-yield key points, generate definitive <strong>2 Marks Views</strong> (precise definitions & formulas), and comprehensive <strong>16 Marks Views</strong> (structured university essays & derivations).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-2">
                Select Study Document
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedDocId(newId);
                  const doc = documents.find((d) => d.id === newId);
                  if (doc) triggerGeneration(doc, summaryFormat);
                }}
                className="w-full rounded-xl border border-[#DEDCEF] bg-white p-3 text-xs sm:text-sm font-medium text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
              >
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.is_custom ? "📄 [Uploaded] " : "📚 "}
                    {doc.title} ({doc.page_count} pages)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#8396B1] mb-2">
                Synthesis Scope
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "detailed", label: "Detailed" },
                  { id: "key_points", label: "Key Points" },
                  { id: "short", label: "Executive" },
                  { id: "chapter", label: "Chapter" },
                  { id: "concepts", label: "Concepts" },
                  { id: "topic", label: "Topic" },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      setSummaryFormat(fmt.id as any);
                      if (currentDoc) triggerGeneration(currentDoc, fmt.id);
                    }}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      summaryFormat === fmt.id
                        ? "bg-[#1D156B] text-white border-[#1D156B] shadow-glow-ink"
                        : "bg-white text-[#4C4B84] border-[#DEDCEF] hover:bg-[#F7F9FD]"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleManualGenerate}
              disabled={loading || !currentDoc}
              className="btn-weaviate-primary text-xs px-6 py-2.5 disabled:opacity-50 gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#1D156B]" />
                  <span>Gemini Synthesizing Exam Blueprint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#1D156B]" />
                  <span>Generate Exam Blueprint</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Indicator for Document */}
        {loading && (
          <div className="card-weaviate p-8 bg-[#DCF090]/20 border-2 border-[#CFDE22] text-center space-y-3 animate-pulse">
            <div className="h-10 w-10 mx-auto rounded-xl bg-[#1D156B] text-[#CFDE22] flex items-center justify-center shadow-glow-ink">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
            <h3 className="font-bold font-display text-base text-[#1D156B]">
              Generating 2-Marks & 16-Marks Exam Blueprint for: {currentDoc?.title || "Document"}
            </h3>
            <p className="text-xs text-[#4C4B84] max-w-md mx-auto">
              Reading syllabus text, formulating high-scoring 2-mark definitions, and structuring full 16-mark essay model answers with derivations...
            </p>
          </div>
        )}

        {/* Exam Point of View Navigation Bar */}
        <div className="card-weaviate p-4 bg-white flex flex-wrap items-center justify-between gap-3 border border-[#DEDCEF]">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#CFDE22] shrink-0" />
            <span className="text-xs font-mono font-bold uppercase text-[#1D156B]">
              Exam View Mode:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "🎯 Complete Blueprint", badge: "All" },
              { id: "two_marks", label: "⚡ 2 Marks Exam View", badge: `${twoMarksList.length} Qs` },
              { id: "sixteen_marks", label: "🏛️ 16 Marks Exam View", badge: `${sixteenMarksList.length} Essays` },
              { id: "standard", label: "📋 Standard Summary", badge: "Summary" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setExamFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
                  examFilter === tab.id
                    ? "bg-[#1D156B] text-white border-[#1D156B] shadow-glow-ink"
                    : "bg-[#F7F9FD] text-[#4C4B84] border-[#DEDCEF] hover:bg-white"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    examFilter === tab.id
                      ? "bg-[#CFDE22] text-[#1D156B]"
                      : "bg-[#DEDCEF] text-[#4C4B84]"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyAll}
            className="btn-weaviate-secondary text-xs px-3.5 py-1.5 gap-1.5 shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#1D156B]" /> Copied All
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy Complete Blueprint
              </>
            )}
          </button>
        </div>

        {/* 1. EXAM POINT OF VIEW: 2 MARKS VIEW SECTION */}
        {(examFilter === "all" || examFilter === "two_marks") && twoMarksList.length > 0 && (
          <div className="card-weaviate p-6 sm:p-8 bg-white space-y-6 border-l-4 border-l-[#CFDE22]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDCEF] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#CFDE22] text-[#1D156B] font-mono text-[11px] font-bold">
                    ⚡ 2 MARKS EXAM VIEW
                  </span>
                  <span className="text-xs font-mono text-[#8396B1]">
                    High-Yield University Definitions & Direct Answers
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-display text-[#1D156B] mt-1">
                  High-Yield 2-Mark Questions & Scoring Keywords
                </h3>
              </div>
              <span className="text-xs font-mono text-[#4C4B84] bg-[#F7F9FD] px-3 py-1 rounded-lg border border-[#DEDCEF]">
                Target: Full 2/2 marks per question
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {twoMarksList.map((item, idx) => {
                const key = `2m-${idx}`;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-[#DEDCEF] bg-[#F7F9FD] space-y-3 flex flex-col justify-between hover:border-[#1D156B] transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#1D156B] bg-[#DCF090] px-2 py-0.5 rounded">
                          QUESTION {idx + 1} • [2 MARKS]
                        </span>
                        <span className="font-mono text-[10px] font-semibold text-[#8396B1]">
                          {item.concept}
                        </span>
                      </div>
                      <h4 className="font-sans font-bold text-sm text-[#1D156B]">
                        {item.question}
                      </h4>
                      <p className="font-sans text-xs sm:text-sm text-[#4C4B84] leading-relaxed bg-white p-3.5 rounded-xl border border-[#DEDCEF]">
                        {item.answer}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#DEDCEF] space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#8396B1] uppercase">
                          Examiner Keywords:
                        </span>
                        {item.keyPoints.map((kw, kidx) => (
                          <span
                            key={kidx}
                            className="bg-white text-[#1D156B] border border-[#DEDCEF] text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold"
                          >
                            ✓ {kw}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() =>
                            handleCopySection(
                              `[2 MARKS QUESTION]\n${item.question}\n\n[MODEL ANSWER]\n${item.answer}\n\n[MANDATORY KEYWORDS]\n${item.keyPoints.join(", ")}`,
                              key
                            )
                          }
                          className="text-[11px] font-mono text-[#1D156B] hover:text-[#4C4B84] flex items-center gap-1"
                        >
                          {copiedKey === key ? (
                            <>
                              <Check className="h-3 w-3 text-green-600" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy 2M Answer
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. EXAM POINT OF VIEW: 16 MARKS VIEW SECTION */}
        {(examFilter === "all" || examFilter === "sixteen_marks") && sixteenMarksList.length > 0 && (
          <div className="card-weaviate p-6 sm:p-8 bg-white space-y-8 border-l-4 border-l-[#1D156B]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDCEF] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#1D156B] text-[#CFDE22] font-mono text-[11px] font-bold">
                    🏛️ 16 MARKS EXAM VIEW
                  </span>
                  <span className="text-xs font-mono text-[#8396B1]">
                    University Structured Essays, Derivations & Diagrams
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-display text-[#1D156B] mt-1">
                  Comprehensive 16-Mark University Model Answers
                </h3>
              </div>
              <span className="text-xs font-mono text-[#4C4B84] bg-[#F7F9FD] px-3 py-1 rounded-lg border border-[#DEDCEF]">
                Target: Full 16/16 marks with derivations & diagrams
              </span>
            </div>

            <div className="space-y-8">
              {sixteenMarksList.map((item, idx) => {
                const key = `16m-${idx}`;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl border-2 border-[#DEDCEF] bg-white space-y-5 hover:border-[#1D156B] transition-colors"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DEDCEF]">
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] font-bold text-[#CFDE22] bg-[#1D156B] px-2.5 py-0.5 rounded uppercase">
                          QUESTION {idx + 1} • [16 MARKS UNIVERSITY ESSAY]
                        </span>
                        <h4 className="font-sans font-bold text-base sm:text-lg text-[#1D156B] pt-1">
                          {item.question}
                        </h4>
                      </div>

                      <button
                        onClick={() =>
                          handleCopySection(
                            `[16 MARKS QUESTION]\n${item.question}\n\n[OUTLINE]\n${item.outline.join(" | ")}\n\n[STRUCTURED ANSWER]\n${item.structuredAnswer}\n\n[DIAGRAM/FORMULA]\n${item.diagramsOrFormulas || ""}\n\n[SCORING BLUEPRINT]\n${item.markingSchemeTips || ""}`,
                            key
                          )
                        }
                        className="btn-weaviate-secondary text-xs px-3 py-1.5 gap-1.5 self-start sm:self-center shrink-0"
                      >
                        {copiedKey === key ? (
                          <>
                            <Check className="h-3 w-3 text-[#1D156B]" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy 16M Model Answer
                          </>
                        )}
                      </button>
                    </div>

                    {/* Question Outline Pills */}
                    {item.outline && item.outline.length > 0 && (
                      <div>
                        <span className="text-[11px] font-mono font-bold uppercase text-[#8396B1] block mb-2">
                          Structured Answer Framework:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.outline.map((heading, hIdx) => (
                            <span
                              key={hIdx}
                              className="text-xs font-mono font-semibold bg-[#F7F9FD] text-[#1D156B] border border-[#DEDCEF] px-2.5 py-1 rounded-lg"
                            >
                              {heading}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Structured Answer Body */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-bold uppercase text-[#8396B1] block">
                        Detailed 16-Mark Model Response:
                      </span>
                      <div className="bg-[#F7F9FD] p-5 rounded-xl border border-[#DEDCEF] text-xs sm:text-sm text-[#1D156B] font-sans leading-relaxed whitespace-pre-line">
                        {item.structuredAnswer}
                      </div>
                    </div>

                    {/* Diagram & Formulas Box */}
                    {item.diagramsOrFormulas && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono font-bold uppercase text-[#8396B1] flex items-center gap-1.5">
                          <Code className="h-3.5 w-3.5 text-[#CFDE22]" /> Visual Architecture & Governing Equations:
                        </span>
                        <div className="bg-[#1D156B] text-[#DCF090] font-mono text-xs p-4 rounded-xl overflow-x-auto leading-relaxed border border-[#2E248C]">
                          <pre>{item.diagramsOrFormulas}</pre>
                        </div>
                      </div>
                    )}

                    {/* Scoring Advice / Marking Scheme Tips */}
                    {item.markingSchemeTips && (
                      <div className="bg-[#DCF090]/30 border border-[#CFDE22] p-4 rounded-xl flex items-start gap-3">
                        <Award className="h-5 w-5 text-[#1D156B] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-mono text-xs text-[#1D156B] block">
                            Examiner Scoring Advice for 16/16 Marks:
                          </strong>
                          <p className="text-xs text-[#4C4B84] mt-0.5">
                            {item.markingSchemeTips}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. STANDARD SUMMARY OUTPUT DISPLAY */}
        {(examFilter === "all" || examFilter === "standard") && (
          <div className="card-weaviate p-6 sm:p-8 bg-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEDCEF] pb-4">
              <div>
                <span className="badge-weaviate-lime font-mono">
                  {summaryData.format.toUpperCase()} CHAPTER SYNTHESIS
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-[#1D156B] mt-2">
                  {summaryData.title}
                </h3>
                {currentDoc && (
                  <p className="text-xs font-mono text-[#8396B1] mt-1 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-[#CFDE22]" /> Source: {currentDoc.title}
                  </p>
                )}
              </div>
            </div>

            {/* Key Points */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase text-[#8396B1] mb-3 flex items-center gap-1.5">
                <ListOrdered className="h-4 w-4 text-[#CFDE22]" /> High-Yield Revision Points
              </h4>
              <div className="space-y-2.5">
                {summaryData.keyPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-[#DEDCEF] bg-[#F7F9FD] p-3.5"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[#1D156B] text-[#CFDE22] font-mono text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-sans text-[#1D156B] leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Summary */}
            {summaryData.detailedSummary && (
              <div>
                <h4 className="text-xs font-mono font-bold uppercase text-[#8396B1] mb-2">
                  Comprehensive Academic Overview
                </h4>
                <p className="text-xs sm:text-sm font-sans text-[#4C4B84] leading-relaxed bg-[#F7F9FD] p-5 rounded-2xl border border-[#DEDCEF]">
                  {summaryData.detailedSummary}
                </p>
              </div>
            )}

            {/* Core Concepts with Interactive 2-Mark & 16-Mark Tabs */}
            {summaryData.coreConcepts && summaryData.coreConcepts.length > 0 && (
              <div>
                <h4 className="text-xs font-mono font-bold uppercase text-[#8396B1] mb-3 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-[#CFDE22]" /> Core Concepts with Exam Perspectives
                </h4>
                <div className="space-y-4">
                  {summaryData.coreConcepts.map((c, i) => {
                    const currentTab = conceptActiveTab[i] || "overview";
                    return (
                      <div
                        key={i}
                        className="card-weaviate p-5 bg-white border border-[#DEDCEF] space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDCEF] pb-2">
                          <div className="font-bold font-display text-base text-[#1D156B]">
                            {c.name}
                          </div>

                          {/* Concept Sub-tabs */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setConceptActiveTab((prev) => ({
                                  ...prev,
                                  [i]: "overview",
                                }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                                currentTab === "overview"
                                  ? "bg-[#1D156B] text-white"
                                  : "text-[#4C4B84] hover:bg-[#F7F9FD]"
                              }`}
                            >
                              Overview
                            </button>
                            {c.twoMarksView && (
                              <button
                                type="button"
                                onClick={() =>
                                  setConceptActiveTab((prev) => ({
                                    ...prev,
                                    [i]: "2marks",
                                  }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                                  currentTab === "2marks"
                                    ? "bg-[#CFDE22] text-[#1D156B]"
                                    : "text-[#4C4B84] hover:bg-[#F7F9FD]"
                                }`}
                              >
                                ⚡ 2 Marks View
                              </button>
                            )}
                            {c.sixteenMarksView && (
                              <button
                                type="button"
                                onClick={() =>
                                  setConceptActiveTab((prev) => ({
                                    ...prev,
                                    [i]: "16marks",
                                  }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                                  currentTab === "16marks"
                                    ? "bg-[#1D156B] text-[#CFDE22]"
                                    : "text-[#4C4B84] hover:bg-[#F7F9FD]"
                                }`}
                              >
                                🏛️ 16 Marks View
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Overview Tab Content */}
                        {currentTab === "overview" && (
                          <p className="text-xs sm:text-sm text-[#4C4B84] leading-relaxed font-sans">
                            {c.description}
                          </p>
                        )}

                        {/* 2 Marks Tab Content */}
                        {currentTab === "2marks" && c.twoMarksView && (
                          <div className="p-4 rounded-xl bg-[#F7F9FD] border border-[#DEDCEF] space-y-2">
                            <div className="font-mono text-[10px] font-bold text-[#1D156B] uppercase">
                              2-Mark Question:
                            </div>
                            <h5 className="font-sans font-bold text-xs sm:text-sm text-[#1D156B]">
                              {c.twoMarksView.question}
                            </h5>
                            <p className="text-xs text-[#4C4B84] bg-white p-3 rounded-lg border border-[#DEDCEF]">
                              {c.twoMarksView.answer}
                            </p>
                            <div className="flex flex-wrap items-center gap-1 pt-1">
                              <span className="text-[10px] font-mono text-[#8396B1]">
                                Keywords:
                              </span>
                              {c.twoMarksView.keywords.map((kw, kwIdx) => (
                                <span
                                  key={kwIdx}
                                  className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#DEDCEF] text-[#1D156B]"
                                >
                                  ✓ {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 16 Marks Tab Content */}
                        {currentTab === "16marks" && c.sixteenMarksView && (
                          <div className="p-4 rounded-xl bg-[#F7F9FD] border border-[#DEDCEF] space-y-3">
                            <div className="font-mono text-[10px] font-bold text-[#CFDE22] bg-[#1D156B] px-2 py-0.5 rounded inline-block uppercase">
                              16-Mark Question:
                            </div>
                            <h5 className="font-sans font-bold text-xs sm:text-sm text-[#1D156B]">
                              {c.sixteenMarksView.question}
                            </h5>
                            <div className="text-xs text-[#4C4B84] bg-white p-4 rounded-lg border border-[#DEDCEF] whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto font-sans">
                              {c.sixteenMarksView.structuredAnswer}
                            </div>
                            {c.sixteenMarksView.scoringAdvice && (
                              <div className="text-[11px] font-sans text-[#1D156B] bg-[#DCF090]/40 p-2.5 rounded-lg border border-[#CFDE22]">
                                <strong>Exam Tip:</strong> {c.sixteenMarksView.scoringAdvice}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function SummariesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center font-mono text-xs">
          Loading Summaries...
        </div>
      }
    >
      <SummariesContent />
    </Suspense>
  );
}
