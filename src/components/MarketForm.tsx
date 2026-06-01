"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useMarket } from "@/lib/store";
import { MARKET_CATEGORIES, MarketCategory } from "@/lib/storage";

export function MarketForm() {
  const { addItem } = useMarket();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MarketCategory>("Outros");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addItem({ title: title.trim(), category, bought: false });
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-border bg-card/50 backdrop-blur-md space-y-3">
      <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-2 ring-1 ring-border focus-within:ring-primary/60 transition-all">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Adicionar produto..."
          className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground py-1" />
        {title && (
          <button type="button" onClick={() => setTitle("")} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value as MarketCategory)}
          className="flex-1 bg-slate-800 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/60 text-white transition-all">
          {MARKET_CATEGORIES.map(cat => (
            <option key={cat} value={cat} className="bg-slate-800 text-white">{cat}</option>
          ))}
        </select>
        <button type="submit" disabled={!title.trim()}
          className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 hover:brightness-110 transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)]">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
