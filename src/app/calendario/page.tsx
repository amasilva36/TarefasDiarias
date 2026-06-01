"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTasks } from "@/lib/store";
import { useReminders } from "@/lib/store";
import { cn } from "@/lib/utils";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks } = useTasks();
  const { reminders } = useReminders();
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const eventsByDay: Record<number, Array<{ id: string; title: string; type: "task" | "reminder"; date: Date }>> = {};

  tasks.forEach(t => {
    if (t.dueDate && !t.completed) {
      const d = new Date(t.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (!eventsByDay[d.getDate()]) eventsByDay[d.getDate()] = [];
        eventsByDay[d.getDate()].push({ id: t.id, title: t.title, type: "task", date: d });
      }
    }
  });

  reminders.forEach(r => {
    if (r.nextDate) {
      const d = new Date(r.nextDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (!eventsByDay[d.getDate()]) eventsByDay[d.getDate()] = [];
        eventsByDay[d.getDate()].push({ id: r.id, title: r.title, type: "reminder", date: d });
      }
    }
  });

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const selectedEvents = selectedDate && eventsByDay[selectedDate] ? eventsByDay[selectedDate] : [];

  return (
    <div className="flex flex-col min-h-full bg-background">
      <div className="p-4 bg-card/50 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">Calendário</h1>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-semibold text-base capitalize">{currentDate.toLocaleString("pt-PT", { month: "long", year: "numeric" })}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-7 gap-y-2 mb-4">
          {weekDays.map(wd => (
            <div key={wd} className="text-center text-xs font-semibold text-muted-foreground pb-2">{wd}</div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="h-10" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const hasEvents = !!eventsByDay[day];
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            const isSelected = selectedDate === day;
            return (
              <button key={day} onClick={() => setSelectedDate(day)}
                className={cn("h-10 w-10 mx-auto rounded-full flex flex-col items-center justify-center relative transition-all text-sm",
                  isSelected ? "bg-primary text-primary-foreground font-bold shadow-[0_0_12px_rgba(34,211,238,0.4)]" : "hover:bg-muted",
                  isToday && !isSelected && "border-2 border-primary text-primary font-semibold")}>
                <span>{day}</span>
                {hasEvents && <div className={cn("absolute bottom-1 w-1 h-1 rounded-full", isSelected ? "bg-primary-foreground" : "bg-primary")} />}
              </button>
            );
          })}
        </div>

        <div className="border-t border-border pt-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            {selectedDate
              ? `${selectedDate} de ${currentDate.toLocaleString("pt-PT", { month: "long" })}`
              : "Selecione um dia"}
          </h2>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem eventos marcados.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map(ev => (
                <div key={`${ev.type}-${ev.id}`} className="flex items-center gap-3 p-3 bg-card/60 rounded-xl border border-border hover:bg-card/80 transition-all">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", ev.type === "task" ? "bg-primary shadow-[0_0_6px_rgba(34,211,238,0.8)]" : "bg-yellow-400")} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ev.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {ev.type === "task" ? "Tarefa" : "Lembrete"} · {ev.date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
