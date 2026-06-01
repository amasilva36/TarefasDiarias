import { useState, useEffect } from 'react';
import { storage, Task } from '../storage';

const TASKS_KEY = '@omeudia:tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTasks(storage.get<Task[]>(TASKS_KEY, []));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      storage.set(TASKS_KEY, tasks);
    }
  }, [tasks, isLoaded]);

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: crypto.randomUUID() };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, addTask, updateTask, removeTask, isLoaded };
}
