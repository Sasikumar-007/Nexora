"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import { MOCK_REVISION_PLAN } from "@/lib/demo/mock-data";
import { RevisionTask } from "@/types/database";

export default function PlannerPage() {
  const [examDate, setExamDate] = useState(MOCK_REVISION_PLAN.exam_date);
  const [dailyHours, setDailyHours] = useState(MOCK_REVISION_PLAN.available_hours_per_day);
  const [tasks, setTasks] = useState<RevisionTask[]>(MOCK_REVISION_PLAN.tasks);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTopic, setNewTaskTopic] = useState("");
  const [newTaskMinutes, setNewTaskMinutes] = useState(45);

  const calculateDaysRemaining = () => {
    const target = new Date(examDate).getTime();
    const today = new Date().getTime();
    return Math.max(1, Math.ceil((target - today) / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = calculateDaysRemaining();
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = Math.round((completedTasks / tasks.length) * 100) || 0;

  const toggleTaskStatus = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examDate,
          availableHoursPerDay: dailyHours,
          title: "Exam Preparation Plan",
        }),
      });

      const data = await res.json();
      if (data.plan && data.plan.tasks) {
        setTasks(data.plan.tasks);
      }
    } catch (err) {
      console.error("Revision planner error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: RevisionTask = {
      id: "task-" + Date.now(),
      plan_id: "plan-1",
      user_id: "user-demo-123",
      title: newTaskTitle,
      topic: newTaskTopic || "Core Concepts",
      scheduled_date: new Date().toISOString().split("T")[0],
      estimated_minutes: newTaskMinutes,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setNewTaskTopic("");
  };

  return (
    <AppShell title="Adaptive Revision Timeline & Planner">
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Countdown Banner */}
        <div className="card-weaviate p-6 sm:p-8 bg-[#1D156B] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-glow-ink">
          <div>
            <span className="badge-weaviate-lime font-mono mb-2">
              <Calendar className="h-3 w-3" /> EXAM TELEMETRY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              {daysRemaining} Days Until Target Examination
            </h2>
            <p className="text-xs sm:text-sm text-[#A2B9C0] mt-1 font-mono">
              Target Date: {examDate} • Planned: {dailyHours} hrs/day
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="btn-weaviate-primary text-xs px-5 py-2.5 disabled:opacity-50 gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Synthesizing Schedule..." : "AI Rebalance Schedule"}
            </button>
          </div>
        </div>

        {/* Progress & Target Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-weaviate p-6 bg-white md:col-span-2">
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#1D156B]">
              <span className="font-bold">Revision Milestone Progress</span>
              <span className="text-[#8396B1]">
                {completedTasks} of {tasks.length} Completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-[#DEDCEF] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#CFDE22] h-full rounded-full transition-all duration-300 shadow-glow-lime-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddTask} className="mt-6 pt-4 border-t border-[#DEDCEF] flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add revision milestone (e.g. Master Bayes Theorem)..."
                className="flex-1 rounded-xl border border-[#DEDCEF] px-3.5 py-2 text-xs text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
              />
              <input
                type="text"
                value={newTaskTopic}
                onChange={(e) => setNewTaskTopic(e.target.value)}
                placeholder="Topic tag"
                className="w-32 rounded-xl border border-[#DEDCEF] px-3 py-2 text-xs text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
              />
              <button
                type="submit"
                className="btn-weaviate-primary text-xs px-4 py-2 shrink-0 gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </form>
          </div>

          <div className="card-weaviate p-6 bg-white space-y-4">
            <h3 className="font-bold font-display text-sm text-[#1D156B]">Plan Settings</h3>
            <div>
              <label className="block text-xs font-mono text-[#8396B1] mb-1">
                Exam Target Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full rounded-xl border border-[#DEDCEF] p-2 text-xs font-mono text-[#1D156B] focus:outline-none focus:border-[#1D156B]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#8396B1] mb-1">
                Daily Study Hours ({dailyHours} hrs)
              </label>
              <input
                type="range"
                min="0.5"
                max="6"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full accent-[#CFDE22]"
              />
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold font-display text-[#1D156B] tracking-tight">
            Scheduled Study Milestones
          </h3>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="card-weaviate p-4 bg-white flex items-center justify-between gap-4 hover:border-[#1D156B]/30 transition-all"
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`h-5 w-5 rounded border border-[#1D156B] flex items-center justify-center shrink-0 transition-colors ${
                      task.status === "completed" ? "bg-[#1D156B]" : "bg-white"
                    }`}
                  >
                    {task.status === "completed" && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#CFDE22]" />
                    )}
                  </button>

                  <div>
                    <h4
                      className={`text-xs sm:text-sm font-semibold text-[#1D156B] leading-snug ${
                        task.status === "completed" ? "line-through text-[#8396B1]" : ""
                      }`}
                    >
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs font-mono text-[#8396B1] mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {task.scheduled_date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {task.estimated_minutes} mins
                      </span>
                      <span>•</span>
                      <span className="rounded bg-[#DCF090] px-1.5 py-0.2 text-[10px] font-bold text-[#1D156B]">
                        {task.topic}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-[#8396B1] hover:text-red-500 transition-colors"
                  title="Remove task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
