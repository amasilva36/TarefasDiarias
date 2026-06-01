"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Bell, ShoppingCart, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks, useReminders, useMarket } from "@/lib/store";

export function BottomNav() {
  const pathname = usePathname();
  const { tasks } = useTasks();
  const { reminders } = useReminders();
  const { items } = useMarket();

  const pendingTasks = tasks.filter(t => !t.completed).length;
  const pendingMarket = items.filter(i => !i.bought).length;

  const tabs = [
    { name: "Tarefas", path: "/tarefas", icon: CheckSquare, badge: pendingTasks },
    { name: "Lembretes", path: "/lembretes", icon: Bell, badge: reminders.length },
    { name: "Mercado", path: "/supermercado", icon: ShoppingCart, badge: pendingMarket },
    { name: "Calendário", path: "/calendario", icon: CalendarDays, badge: 0 },
  ];

  return (
    <nav className="absolute bottom-0 w-full h-16 bg-card/80 backdrop-blur-xl border-t border-border flex items-center justify-around z-50">
      {tabs.map(tab => {
        const isActive = pathname === tab.path || (pathname === '/' && tab.path === '/tarefas');
        return (
          <Link key={tab.path} href={tab.path}
            className={cn("flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative", 
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
            {isActive && <div className="absolute top-0 w-1/3 h-0.5 bg-primary shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-b-full" />}
            <div className="relative">
              <tab.icon className="w-5 h-5" />
              {tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold px-1 min-w-3.5 h-3.5 flex items-center justify-center rounded-full shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
