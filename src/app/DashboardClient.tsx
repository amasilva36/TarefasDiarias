"use client";

import { useTasks, useReminders, useMarket } from "@/lib/store";
import Link from "next/link";
import { CheckSquare, Bell, ShoppingCart, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardClient({ firstName }: { firstName: string }) {
  const { tasks } = useTasks();
  const { reminders } = useReminders();
  const { items } = useMarket();

  const [greeting, setGreeting] = useState("Olá");
  const [todayStr, setTodayStr] = useState("");
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 19) setGreeting("Boa tarde");
    else setGreeting("Boa noite");

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    setTodayStr(new Date().toLocaleDateString('pt-PT', dateOptions));
  }, []);

  const pendingTasks = tasks.filter(t => !t.completed);
  const doneTasks = tasks.filter(t => t.completed);
  const urgentTasks = pendingTasks.filter(t => t.isUrgent);
  const todayReminders = reminders.filter(r => {
    if (r.completed) return false;
    const isToday = new Date(r.datetime).toDateString() === new Date().toDateString();
    return isToday;
  });
  const pendingMarket = items.filter(i => !i.bought);

  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 p-6 pb-24 task-enter">
      <header>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          {greeting}, <span className="text-primary">{firstName}</span>!
        </h1>
        <p className="text-muted-foreground mt-1 capitalize font-medium">{todayStr}</p>
      </header>

      {/* Progresso do Dia */}
      <section className="bg-card/40 border border-border p-5 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Progresso de Tarefas</h2>
            <p className="text-2xl font-bold">{doneTasks.length} / {totalTasks}</p>
          </div>
          <div className="text-3xl font-black text-primary">{progress}%</div>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      {/* Cartões de Resumo */}
      <div className="grid grid-cols-1 gap-4">
        <Link href="/tarefas" className="flex items-center p-4 bg-card/40 border border-border rounded-xl hover:bg-card/80 transition-colors shadow-sm group">
          <div className="bg-primary/20 p-3 rounded-lg mr-4">
            <CheckSquare className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Tarefas</h3>
            <p className="text-sm text-muted-foreground">
              {pendingTasks.length === 0 ? "Tudo feito! 🎉" : `${pendingTasks.length} pendentes`}
              {urgentTasks.length > 0 && <span className="text-destructive font-semibold ml-2">({urgentTasks.length} urgentes)</span>}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        <Link href="/lembretes" className="flex items-center p-4 bg-card/40 border border-border rounded-xl hover:bg-card/80 transition-colors shadow-sm group">
          <div className="bg-blue-500/20 p-3 rounded-lg mr-4 group-hover:bg-blue-500/30 transition-colors">
            <Bell className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Lembretes Hoje</h3>
            <p className="text-sm text-muted-foreground">
              {todayReminders.length === 0 ? "Nenhum para hoje." : `${todayReminders.length} por tocar 🔔`}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
        </Link>

        <Link href="/supermercado" className="flex items-center p-4 bg-card/40 border border-border rounded-xl hover:bg-card/80 transition-colors shadow-sm group">
          <div className="bg-emerald-500/20 p-3 rounded-lg mr-4 group-hover:bg-emerald-500/30 transition-colors">
            <ShoppingCart className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Supermercado</h3>
            <p className="text-sm text-muted-foreground">
              {pendingMarket.length === 0 ? "Carrinho vazio!" : `${pendingMarket.length} artigos na lista 🛒`}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
        </Link>
      </div>

    </div>
  );
}
