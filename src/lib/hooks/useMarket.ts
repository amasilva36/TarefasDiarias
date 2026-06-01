import { useState, useEffect } from 'react';
import { storage, MarketItem } from '../storage';

const MARKET_KEY = '@omeudia:market';

export function useMarket() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(storage.get<MarketItem[]>(MARKET_KEY, []));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      storage.set(MARKET_KEY, items);
    }
  }, [items, isLoaded]);

  const addItem = (item: Omit<MarketItem, 'id'>) => {
    const newItem: MarketItem = { ...item, id: crypto.randomUUID() };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: Partial<MarketItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearBought = () => {
    setItems((prev) => prev.filter((i) => !i.bought));
  };

  const clearAll = () => {
    setItems([]);
  };

  return { items, addItem, updateItem, removeItem, clearBought, clearAll, isLoaded };
}
