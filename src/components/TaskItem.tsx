"use client";

import { useState } from "react";
import { Check, Trash2, Clock, Pencil, Save, X } from "lucide-react";
import { Task } from "@/lib/storage";
import { useTasks } from "@/lib/store";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export function TaskItem({ task }: { task: Task }) {
  const { tasks, updateTask, removeTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDate, setEditDate] = useState(task.dueDate || "");

  const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate).getTime() < new Date().getTime();

  const handleSave = () => {
    if (!editTitle.trim()) return;
    updateTask(task.id, { title: editTitle.trim(), dueDate: editDate || undefined });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title); setEditDate(task.dueDate || ""); setIsEditing(false);
  };

  const handleToggleComplete = () => {
    const isCompleting = !task.completed;
    updateTask(task.id, { completed: isCompleting });

    // Disparar confetti se for concluir a última tarefa pendente!
    if (isCompleting) {
      const pendingTasks = tasks.filter(t => !t.completed);
      if (pendingTasks.length === 1 && pendingTasks[0].id === task.id) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22d3ee', '#3b82f6', '#8b5cf6', '#a855f7', '#ffffff']
        });
      }
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 p-4 border-b border-border bg-card/80 backdrop-blur-md animate-[fadeSlideIn_0.25s_ease-out]">
        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
          className="w-full bg-transparent border-b border-border pb-1 focus:outline-none text-sm text-foreground focus:border-primary transition-colors" autoFocus />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <input type="datetime-local" value={editDate} onChange={(e) => setEditDate(e.target.value)}
            className="flex-1 text-sm bg-transparent border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="flex items-center justify-end gap-2 mt-2">
          <button onClick={handleCancel} className="p-1.5 text-muted-foreground hover:bg-muted rounded-full"><X className="w-4 h-4" /></button>
          <button onClick={handleSave} disabled={!editTitle.trim()} className="p-1.5 text-primary hover:bg-primary/20 rounded-full disabled:opacity-50"><Save className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 p-4 border-b border-border bg-card/40 backdrop-blur-sm transition-all hover:bg-card/80 hover:scale-[1.01] hover:shadow-lg animate-[fadeSlideIn_0.3s_ease-out]", task.completed && "opacity-50")}>
      <button onClick={handleToggleComplete}
        className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
          task.completed ? "bg-primary border-primary text-primary-foreground scale-110" : "border-muted-foreground hover:border-primary")}>
        {task.completed && <Check className="w-3.5 h-3.5 animate-[popIn_0.2s_ease-out]" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate transition-all duration-300", task.completed && "line-through text-muted-foreground")}>{task.title}</p>
        {(task.dueDate || isOverdue || task.urgent) && (
          <div className="flex items-center gap-2 mt-1">
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}</span>
              </div>
            )}
            {isOverdue && (
              <span className="text-[10px] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(255,0,0,0.5)]">Em atraso</span>
            )}
            {task.urgent && (
              <span className="text-[10px] font-bold border border-orange-500 text-orange-500 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(249,115,22,0.3)]">Urgente</span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => setIsEditing(true)} className="p-2 text-muted-foreground hover:text-primary rounded-full transition-colors"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => { if (confirm("Eliminar tarefa?")) removeTask(task.id); }} className="p-2 text-muted-foreground hover:text-destructive rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
