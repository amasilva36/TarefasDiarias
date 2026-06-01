"use client";

import { useMarket } from "@/lib/store";
import { MarketForm } from "@/components/MarketForm";
import { MarketItemView } from "@/components/MarketItem";
import { MARKET_CATEGORIES } from "@/lib/storage";
import { Trash2, RefreshCcw } from "lucide-react";

export default function SupermercadoPage() {
  const { items, clearBought, clearAll, isLoaded } = useMarket();

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  const handleClearAll = () => { if (confirm("Tem a certeza que quer apagar toda a lista?")) clearAll(); };
  const boughtCount = items.filter(i => i.bought).length;
  const totalCount = items.length;

  const groupedItems = MARKET_CATEGORIES.map(category => {
    const catItems = items.filter(i => i.category === category);
    catItems.sort((a, b) => { if (a.bought !== b.bought) return a.bought ? 1 : -1; return a.title.localeCompare(b.title); });
    return { category, items: catItems };
  }).filter(group => group.items.length > 0);

  return (
    <div className="flex flex-col min-h-full">
      <div className="p-4 bg-card/50 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">Supermercado</h1>
            {totalCount > 0 && <p className="text-xs text-muted-foreground mt-0.5">{boughtCount}/{totalCount} comprados</p>}
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-1">
              <button onClick={clearBought} disabled={boughtCount === 0}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-primary border border-border rounded-lg hover:border-primary/50 disabled:opacity-30 transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Limpar
              </button>
              <button onClick={handleClearAll}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 border border-border rounded-lg hover:border-destructive/50 transition-all">
                <RefreshCcw className="w-3.5 h-3.5" /> Nova lista
              </button>
            </div>
          )}
        </div>
        {totalCount > 0 && (
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
              style={{ width: `${(boughtCount / totalCount) * 100}%` }} />
          </div>
        )}
      </div>
      <MarketForm />
      <div className="flex-1 pb-6">
        {groupedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-3xl">🛒</span></div>
            <p className="text-sm">A lista está vazia.</p>
          </div>
        ) : (
          groupedItems.map(group => (
            <div key={group.category} className="mb-2">
              <div className="px-4 py-2 bg-muted/20 text-xs font-bold text-primary uppercase tracking-widest border-y border-border">{group.category}</div>
              <div>{group.items.map(item => <MarketItemView key={item.id} item={item} />)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
