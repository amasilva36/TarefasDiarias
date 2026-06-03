"use client";

import { useReminders } from "@/lib/store";
import { ReminderForm } from "@/components/ReminderForm";
import { ReminderItem } from "@/components/ReminderItem";
import PushNotificationManager from "@/components/PushNotificationManager";

export default function LembretesPage() {
  const { reminders, isLoaded } = useReminders();

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  const sortedReminders = [...reminders].sort((a, b) =>
    new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()
  );

  return (
    <div className="flex flex-col min-h-full">
      <div className="p-4 bg-card/50 backdrop-blur-md border-b border-border sticky top-0 z-10 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">Lembretes</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{sortedReminders.length} agendado{sortedReminders.length !== 1 ? "s" : ""}</p>
        </div>
        <PushNotificationManager />
      </div>
      <ReminderForm />
      <div className="flex-1 pb-6">
        {sortedReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-3xl">🔔</span></div>
            <p className="text-sm">Sem lembretes agendados.</p>
          </div>
        ) : (
          sortedReminders.map((reminder) => <ReminderItem key={reminder.id} reminder={reminder} />)
        )}
      </div>
    </div>
  );
}
