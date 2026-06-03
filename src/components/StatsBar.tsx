"use client";

import { useTasks, useMarket } from "@/lib/store";
import { CheckSquare, ShoppingCart, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function StatsBar() {
  const { tasks, isLoaded: tasksLoaded } = useTasks();
  const { items: marketItems, isLoaded: marketLoaded } = useMarket();

  if (!tasksLoaded || !marketLoaded) return <div className="h-12 bg-card/20" />;

  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const overdueCount = tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length;
  const pendingMarket = marketItems.filter((i) => !i.bought).length;

  return (
    <div className="flex items-center justify-between px-5 h-12 bg-card/50 backdrop-blur-md text-xs font-medium text-muted-foreground border-b border-border shadow-sm">
      <div className="flex items-center gap-2">
        <CheckSquare className="w-3.5 h-3.5 text-primary" />
        <span className="text-foreground font-semibold">{pendingTasks}</span>
        <span>pendentes</span>
        {overdueCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-destructive text-destructive-foreground rounded text-[10px] font-bold shadow-[0_0_8px_rgba(255,50,50,0.5)]">
            {overdueCount} em atraso
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <ShoppingCart className="w-3.5 h-3.5 text-primary" />
          <span className="text-foreground font-semibold">{pendingMarket}</span>
        </div>
        <div className="w-[1px] h-4 bg-border mx-1"></div>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
          title="Sair (Logout)"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="sr-only">Sair</span>
        </button>
      </div>
    </div>
  );
}
