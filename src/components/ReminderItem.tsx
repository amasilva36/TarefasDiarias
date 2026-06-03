"use client";

import { Trash2, Repeat, Clock, Check } from "lucide-react";
import { Reminder } from "@/lib/storage";
import { useReminders } from "@/lib/store";

const repeatLabels: Record<string, string> = { none: "Uma vez", daily: "Diário", weekly: "Semanal", monthly: "Mensal" };

export function ReminderItem({ reminder }: { reminder: Reminder }) {
  const { removeReminder, updateReminder } = useReminders();

  const handleAcknowledge = () => {
    if (reminder.repeat === "none") { removeReminder(reminder.id); return; }
    const date = new Date(reminder.nextDate);
    if (reminder.repeat === "daily") date.setDate(date.getDate() + 1);
    if (reminder.repeat === "weekly") date.setDate(date.getDate() + 7);
    if (reminder.repeat === "monthly") date.setMonth(date.getMonth() + 1);
    updateReminder(reminder.id, { nextDate: date.toISOString() });
  };

  const isUpcoming = new Date(reminder.nextDate) <= new Date(Date.now() + 60 * 60 * 1000);

  return (
    <div className="flex items-center gap-3 p-4 border-b border-border bg-card/40 backdrop-blur-sm hover:bg-card/80 transition-all">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{reminder.title}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary" />
            <span>{new Date(reminder.nextDate).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Repeat className="w-3 h-3 text-primary" />
            <span>{repeatLabels[reminder.repeat]}</span>
          </div>
          {isUpcoming && <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-bold">Em breve</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={handleAcknowledge} className="p-2 text-primary hover:bg-primary/20 rounded-full transition-colors"><Check className="w-4 h-4" /></button>
        <button onClick={() => removeReminder(reminder.id)} className="p-2 text-muted-foreground hover:text-destructive rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
