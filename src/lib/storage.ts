export type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // ISO date string
  reminderDate?: string; // ISO date string
  urgent?: boolean;
  category?: string;
};

export type ReminderRepeat = 'none' | 'daily' | 'weekly' | 'monthly';

export type Reminder = {
  id: string;
  title: string;
  repeat: ReminderRepeat;
  nextDate: string; // ISO date string
};

export const MARKET_CATEGORIES = [
  'Frutas e Legumes',
  'Laticínios',
  'Padaria',
  'Carnes e Peixe',
  'Congelados',
  'Bebidas',
  'Higiene',
  'Limpeza',
  'Outros',
] as const;

export type MarketCategory = typeof MARKET_CATEGORIES[number];

export type MarketItem = {
  id: string;
  title: string;
  category: MarketCategory;
  bought: boolean;
  orderIndex: number;
};

// Generic storage wrapper
const isBrowser = typeof window !== 'undefined';

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (!isBrowser) return fallback;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  },
};
