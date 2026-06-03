"use client";

import { useState } from "react";
import { Plus, Calendar, Bell, X, Tag } from "lucide-react";
import { useTasks } from "@/lib/store";
import { cn } from "@/lib/utils";
import { TASK_CATEGORIES } from "@/lib/categories";

export function TaskForm() {
  const { addTask } = useTasks();
  const [title, setTitle] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ 
      title: title.trim(), 
      completed: false, 
      dueDate: dueDate || undefined, 
      reminderDate: reminderDate || undefined,
      urgent,
      category: category || undefined
    });
    setTitle(""); setDueDate(""); setReminderDate(""); setShowDetails(false); setUrgent(false); setCategory("");
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDueDate(val);
    if (val && !reminderDate) setReminderDate(val);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-border bg-card/50 backdrop-blur-md">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-2 ring-1 ring-border focus-within:ring-primary/60 transition-all">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nova tarefa..."
            className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground py-1" />
          <button type="button" onClick={() => setShowDetails(!showDetails)}
            className={cn("p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors", showDetails && "text-primary bg-primary/20")}>
            {showDetails ? <X className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
          </button>
          <button type="submit" disabled={!title.trim()}
            className="p-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 hover:brightness-110 transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)]">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Seletor de Categorias */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
          {TASK_CATEGORIES.map(cat => (
             <button key={cat.id} type="button" onClick={() => setCategory(cat.id === category ? "" : cat.id)} 
              className={cn("shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all select-none", 
                category === cat.id ? cat.colorClass : "bg-card/40 border-border text-muted-foreground hover:bg-muted")}>
               {cat.label}
             </button>
          ))}
        </div>
      </div>
      {showDetails && (
        <div className="mt-3 space-y-2 px-1">
          <div className="flex items-center gap-3 bg-muted/20 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <input type="datetime-local" value={dueDate} onChange={handleDueDateChange}
              className="flex-1 text-sm bg-transparent focus:outline-none text-foreground" />
          </div>
          <div className="flex items-center gap-3 bg-muted/20 rounded-lg px-3 py-2">
            <Bell className="w-4 h-4 text-primary shrink-0" />
            <input type="datetime-local" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none text-foreground" />
          </div>
          <div className="flex items-center gap-2 pt-1 px-1">
             <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} id="urgent-form" className="w-4 h-4 rounded border-border" />
             <label htmlFor="urgent-form" className="text-sm text-muted-foreground cursor-pointer select-none">Marcar como urgente</label>
          </div>
        </div>
      )}
    </form>
  );
}
