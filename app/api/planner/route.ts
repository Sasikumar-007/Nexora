import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, examDate, availableHoursPerDay, topics } = body;

    const targetDate = new Date(examDate || Date.now() + 14 * 86400000);
    const now = new Date();
    const daysRemaining = Math.max(
      1,
      Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    const studyTopics =
      topics && topics.length > 0
        ? topics
        : [
            "Foundational Theorems & Definitions",
            "Formula Derivations & Quantitative Methods",
            "Problem Sets & Complex Edge Cases",
            "High-Yield Flashcard Review",
            "Full-Length Practice Mock Exam",
          ];

    const tasks = studyTopics.map((topic: string, index: number) => {
      const dayOffset = Math.min(daysRemaining - 1, Math.floor((index / studyTopics.length) * daysRemaining));
      const scheduled = new Date(now.getTime() + dayOffset * 86400000);

      return {
        id: `task-gen-${index + 1}`,
        title: `Master ${topic}`,
        topic,
        scheduled_date: scheduled.toISOString().split("T")[0],
        estimated_minutes: Math.round((Number(availableHoursPerDay) || 2) * 45),
        status: index === 0 ? "completed" : "pending",
        created_at: new Date().toISOString(),
      };
    });

    const plan = {
      id: "plan-" + Date.now(),
      title: title || "Comprehensive Exam Revision Plan",
      exam_date: targetDate.toISOString().split("T")[0],
      available_hours_per_day: availableHoursPerDay || 2,
      days_remaining: daysRemaining,
      created_at: new Date().toISOString(),
      tasks,
    };

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (err: any) {
    console.error("Planner Generation Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate revision plan" },
      { status: 500 }
    );
  }
}
