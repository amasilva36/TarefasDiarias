"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTasks, useReminders, useMarket } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CheckSquare, Bell, ShoppingCart } from "lucide-react";

export function TopTabs() {
  const pathname = usePathname();
  const { tasks } = useTasks();
  const { reminders } = useReminders();
  const { items } = useMarket();

  const tabs = [
    { name: "Tarefas", path: "/tarefas", icon: CheckSquare, count: tasks.filter(t => !t.completed).length },
    { name: "Lembretes", path: "/lembretes", icon: Bell, count: reminders.length },
    { name: "Supermercado", path: "/supermercado", icon: ShoppingCart, count: items.filter(i => !i.bought).length },
  ];

  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar border-b border-border">
      {tabs.map(tab => {
        const isActive = pathname === tab.path || (pathname === '/' && tab.path === '/tarefas');
        return (
          <Link key={tab.path} href={tab.path}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
              isActive 
                ? "bg-transparent border-foreground text-foreground" 
                : "bg-card border-transparent text-muted-foreground hover:bg-muted"
            )}>
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.name}</span>
            <span className={cn(
              "flex items-center justify-center min-w-5 h-5 rounded-full text-[10px] bg-secondary",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}>
              {tab.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
