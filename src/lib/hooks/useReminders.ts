import { useState, useEffect } from 'react';
import { storage, Reminder } from '../storage';

const REMINDERS_KEY = '@omeudia:reminders';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setReminders(storage.get<Reminder[]>(REMINDERS_KEY, []));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      storage.set(REMINDERS_KEY, reminders);
    }
  }, [reminders, isLoaded]);

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = { ...reminder, id: crypto.randomUUID() };
    setReminders((prev) => [...prev, newReminder]);
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const removeReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return { reminders, addReminder, updateReminder, removeReminder, isLoaded };
}
