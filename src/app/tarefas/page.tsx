"use client";

import { useTasks } from "@/lib/store";
import { TaskForm } from "@/components/TaskForm";
import { TaskItem } from "@/components/TaskItem";

export default function TarefasPage() {
  const { tasks, isLoaded } = useTasks();

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  const now = new Date().getTime();
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (!a.completed && !b.completed) {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      const aOverdue = a.dueDate && new Date(a.dueDate).getTime() < now;
      const bOverdue = b.dueDate && new Date(b.dueDate).getTime() < now;
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
    }
    return 0;
  });

  const pending = sortedTasks.filter(t => !t.completed);
  const done = sortedTasks.filter(t => t.completed);

  return (
    <div className="flex flex-col min-h-full">
      <div className="p-4 bg-card/50 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">Tarefas</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{pending.length} pendente{pending.length !== 1 ? "s" : ""}</p>
      </div>
      <TaskForm />
      <div className="flex-1 pb-6">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-3xl">✓</span></div>
            <p className="text-sm">Sem tarefas. Aproveite o dia!</p>
          </div>
        ) : (
          <>
            {pending.map((task) => <TaskItem key={task.id} task={task} />)}
            {done.length > 0 && (
              <>
                <div className="px-4 py-2 mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Concluídas ({done.length})</div>
                {done.map((task) => <TaskItem key={task.id} task={task} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
