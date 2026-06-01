"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { storage, Task, Reminder, MarketItem } from "./storage";

// ─── TASKS ───────────────────────────────────────────────────────
import { getTasksAction, createTaskAction, updateTaskAction, deleteTaskAction } from "@/app/actions/tasks";
import { getRemindersAction, createReminderAction, updateReminderAction, deleteReminderAction } from "@/app/actions/reminders";
import { getMarketItemsAction, createMarketItemAction, updateMarketItemAction, deleteMarketItemAction, clearBoughtMarketItemsAction, clearAllMarketItemsAction } from "@/app/actions/market";

const TASKS_KEY = "@omeudia:tasks";

type TasksCtx = {
  tasks: Task[];
  isLoaded: boolean;
  addTask: (t: Omit<Task, "id" | "completed">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
};

const TasksContext = createContext<TasksCtx | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getTasksAction().then((data) => {
      setTasks(data as any);
      setIsLoaded(true);
    }).catch(console.error);
  }, []);

  const addTask = async (task: Omit<Task, 'id' | 'completed'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newTask = { ...task, id: tempId, completed: false } as Task;
    setTasks(prev => [newTask, ...prev]); // optimistic update
    
    try {
      await createTaskAction(task);
      // We could fetch again or assume it worked. Let's fetch to sync IDs.
      const freshTasks = await getTasksAction();
      setTasks(freshTasks as any);
    } catch (e) {
      console.error(e);
      setTasks(prev => prev.filter(t => t.id !== tempId)); // rollback
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t)); // optimistic
    try {
      await updateTaskAction(id, updates);
    } catch (e) {
      console.error(e);
      // rollback could be complex, simple reload:
      const freshTasks = await getTasksAction();
      setTasks(freshTasks as any);
    }
  };

  const removeTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id)); // optimistic
    try {
      await deleteTaskAction(id);
    } catch (e) {
      console.error(e);
      const freshTasks = await getTasksAction();
      setTasks(freshTasks as any);
    }
  };

  return (
    <TasksContext.Provider value={{ tasks, isLoaded, addTask, updateTask, removeTask }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}

// ─── REMINDERS ───────────────────────────────────────────────────
const REMINDERS_KEY = "@omeudia:reminders";

type RemindersCtx = {
  reminders: Reminder[];
  isLoaded: boolean;
  addReminder: (r: Omit<Reminder, "id">) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  removeReminder: (id: string) => void;
};

const RemindersContext = createContext<RemindersCtx | null>(null);

export function RemindersProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getRemindersAction().then(data => {
      setReminders(data as any);
      setIsLoaded(true);
    }).catch(console.error);
  }, []);

  const addReminder = async (reminder: Omit<Reminder, 'id'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newReminder = { ...reminder, id: tempId } as Reminder;
    setReminders(prev => [...prev, newReminder]);
    try {
      await createReminderAction(reminder);
      const fresh = await getRemindersAction();
      setReminders(fresh as any);
    } catch (e) {
      setReminders(prev => prev.filter(r => r.id !== tempId));
    }
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    try {
      await updateReminderAction(id, updates);
    } catch (e) {
      const fresh = await getRemindersAction();
      setReminders(fresh as any);
    }
  };

  const removeReminder = async (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    try {
      await deleteReminderAction(id);
    } catch (e) {
      const fresh = await getRemindersAction();
      setReminders(fresh as any);
    }
  };

  return (
    <RemindersContext.Provider value={{ reminders, isLoaded, addReminder, updateReminder, removeReminder }}>
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders() {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error("useReminders must be used within RemindersProvider");
  return ctx;
}

// ─── MARKET ──────────────────────────────────────────────────────
const MARKET_KEY = "@omeudia:market";

type MarketCtx = {
  items: MarketItem[];
  isLoaded: boolean;
  addItem: (i: Omit<MarketItem, "id">) => void;
  updateItem: (id: string, updates: Partial<MarketItem>) => void;
  removeItem: (id: string) => void;
  clearBought: () => void;
  clearAll: () => void;
};

const MarketContext = createContext<MarketCtx | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getMarketItemsAction().then(data => {
      setItems(data as any);
      setIsLoaded(true);
    }).catch(console.error);
  }, []);

  const addItem = async (item: Omit<MarketItem, 'id'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    setItems(prev => [...prev, { ...item, id: tempId }]);
    try {
      await createMarketItemAction(item);
      const fresh = await getMarketItemsAction();
      setItems(fresh as any);
    } catch (e) {
      setItems(prev => prev.filter(i => i.id !== tempId));
    }
  };

  const updateItem = async (id: string, updates: Partial<MarketItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    try {
      await updateMarketItemAction(id, updates);
    } catch (e) {
      const fresh = await getMarketItemsAction();
      setItems(fresh as any);
    }
  };

  const removeItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      await deleteMarketItemAction(id);
    } catch (e) {
      const fresh = await getMarketItemsAction();
      setItems(fresh as any);
    }
  };

  const clearBought = async () => {
    setItems(prev => prev.filter(i => !i.bought));
    try {
      await clearBoughtMarketItemsAction();
    } catch (e) {
      const fresh = await getMarketItemsAction();
      setItems(fresh as any);
    }
  };

  const clearAll = async () => {
    setItems([]);
    try {
      await clearAllMarketItemsAction();
    } catch (e) {
      const fresh = await getMarketItemsAction();
      setItems(fresh as any);
    }
  };

  return (
    <MarketContext.Provider value={{ items, isLoaded, addItem, updateItem, removeItem, clearBought, clearAll }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used within MarketProvider");
  return ctx;
}
