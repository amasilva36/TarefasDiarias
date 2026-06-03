"use client";

import { useState } from "react";
import { Check, Trash2, Clock, Pencil, Save, X } from "lucide-react";
import { Task } from "@/lib/storage";
import { useTasks } from "@/lib/store";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { getCategory, TASK_CATEGORIES } from "@/lib/categories";

export function TaskItem({ task }: { task: Task }) {
  const { tasks, updateTask, removeTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDate, setEditDate] = useState(task.dueDate || "");
  const [editCategory, setEditCategory] = useState(task.category || "");

  const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate).getTime() < new Date().getTime();

  const handleSave = () => {
    if (!editTitle.trim()) return;
    updateTask(task.id, { 
      title: editTitle.trim(), 
      dueDate: editDate || undefined,
      category: editCategory || undefined
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title); setEditDate(task.dueDate || ""); setEditCategory(task.category || ""); setIsEditing(false);
  };

  const handleDelete = () => {
    if (!confirm("Eliminar tarefa?")) return;
    setIsLeaving(true);
    setTimeout(() => removeTask(task.id), 420);
  };

  const handleToggleComplete = () => {
    const isCompleting = !task.completed;
    updateTask(task.id, { completed: isCompleting });

    if (isCompleting) {
      // Conta quantas tarefas pendentes ficam (excluindo esta)
      const remainingPending = tasks.filter(t => !t.completed && t.id !== task.id);

      if (remainingPending.length === 0) {
        // 🎊 Última tarefa! Mega celebração!
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#22d3ee', '#3b82f6', '#8b5cf6', '#a855f7', '#ffffff'] });
        setTimeout(() => confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 } }), 250);
        setTimeout(() => confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 } }), 450);
      } else {
        // ✨ Confetti simples por cada conclusão
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 }, colors: ['#22d3ee', '#8b5cf6', '#ffffff'] });
      }
    }
  };

  if (isEditing) {
    return (
      <div className="task-enter flex flex-col gap-3 p-4 border-b border-border bg-card/80 backdrop-blur-md">
        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
          className="w-full bg-transparent border-b border-border pb-1 focus:outline-none text-sm text-foreground focus:border-primary transition-colors" autoFocus />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <input type="datetime-local" value={editDate} onChange={(e) => setEditDate(e.target.value)}
            className="flex-1 text-sm bg-transparent border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 mt-1">
          {TASK_CATEGORIES.map(cat => (
             <button key={cat.id} type="button" onClick={() => setEditCategory(cat.id === editCategory ? "" : cat.id)} 
              className={cn("shrink-0 text-[10px] uppercase font-bold px-2 py-1 rounded-full border transition-all select-none", 
                editCategory === cat.id ? cat.colorClass : "bg-card/40 border-border text-muted-foreground hover:bg-muted")}>
               {cat.label}
             </button>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-2">
          <button onClick={handleCancel} className="p-1.5 text-muted-foreground hover:bg-muted rounded-full"><X className="w-4 h-4" /></button>
          <button onClick={handleSave} disabled={!editTitle.trim()} className="p-1.5 text-primary hover:bg-primary/20 rounded-full disabled:opacity-50"><Save className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(isLeaving ? "task-leave" : "task-enter", "flex items-center gap-3 p-4 border-b border-border bg-card/40 backdrop-blur-sm transition-colors hover:bg-card/80 hover:scale-[1.01] hover:shadow-lg", task.completed && "opacity-50")}>
      <button onClick={handleToggleComplete}
        className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
          task.completed ? "bg-primary border-primary text-primary-foreground scale-110" : "border-muted-foreground hover:border-primary")}>
        {task.completed && <Check className="w-3.5 h-3.5 check-pop" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate transition-all duration-300", task.completed && "line-through text-muted-foreground")}>{task.title}</p>
        {(task.dueDate || isOverdue || task.urgent || task.category) && (
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
            {task.category && getCategory(task.category) && (
              <span className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ml-auto", getCategory(task.category)?.colorClass)}>
                {getCategory(task.category)?.label}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => setIsEditing(true)} className="p-2 text-muted-foreground hover:text-primary rounded-full transition-colors"><Pencil className="w-4 h-4" /></button>
        <button onClick={handleDelete} className="p-2 text-muted-foreground hover:text-destructive rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
