"use client";

import { useState } from "react";
import { Plus, Repeat, X } from "lucide-react";
import { useReminders } from "@/lib/store";
import { ReminderRepeat } from "@/lib/storage";

export function ReminderForm() {
  const { addReminder } = useReminders();
  const [title, setTitle] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [repeat, setRepeat] = useState<ReminderRepeat>("none");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !nextDate) return;
    addReminder({ title: title.trim(), nextDate, repeat });
    setTitle(""); setNextDate(""); setRepeat("none");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-border bg-card/50 backdrop-blur-md space-y-3">
      <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-2 ring-1 ring-border focus-within:ring-primary/60 transition-all">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="O que quer lembrar?"
          className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground py-1" />
        {title && (
          <button type="button" onClick={() => setTitle("")} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input type="datetime-local" value={nextDate} onChange={(e) => setNextDate(e.target.value)}
          className="flex-1 text-sm bg-muted/20 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/60 text-foreground transition-all" />
        <div className="relative">
          <select value={repeat} onChange={(e) => setRepeat(e.target.value as ReminderRepeat)}
            className="appearance-none bg-muted/20 border border-border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/60 text-foreground transition-all">
            <option value="none">Uma vez</option>
            <option value="daily">Diário</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
          </select>
          <Repeat className="w-4 h-4 text-primary absolute left-2 top-2.5 pointer-events-none" />
        </div>
        <button type="submit" disabled={!title.trim() || !nextDate}
          className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 hover:brightness-110 transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)]">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
