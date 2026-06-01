"use client";

import { useTasks } from "@/lib/store";
import { AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";

export function AlertBanner() {
  const { tasks, isLoaded } = useTasks();

  if (!isLoaded) return null;

  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date());
  
  if (overdueTasks.length === 0) return null;

  return (
    <Link href="/tarefas" className="block px-4 py-3 bg-destructive/10 border-b border-destructive/20 hover:bg-destructive/20 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-destructive/20 rounded-full">
            <AlertTriangle className="w-4 h-4 text-destructive shadow-[0_0_8px_rgba(255,50,50,0.5)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-destructive">
              {overdueTasks.length} tarefa{overdueTasks.length > 1 ? 's' : ''} em atraso
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">{overdueTasks[0].title}</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
