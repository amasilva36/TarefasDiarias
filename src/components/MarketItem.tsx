"use client";

import { Check, Trash2 } from "lucide-react";
import { MarketItem } from "@/lib/storage";
import { useMarket } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MarketItemView({ item }: { item: MarketItem }) {
  const { updateItem, removeItem } = useMarket();

  return (
    <div className={cn("flex items-center gap-3 p-3 border-b border-border bg-card/40 backdrop-blur-sm hover:bg-card/80 transition-all", item.bought && "opacity-50")}>
      <button onClick={() => updateItem(item.id, { bought: !item.bought })}
        className={cn("w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
          item.bought ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground hover:border-primary")}>
        {item.bought && <Check className="w-3 h-3" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm truncate transition-all", item.bought && "line-through text-muted-foreground")}>{item.title}</p>
      </div>
      <button onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground hover:text-destructive rounded-full transition-colors">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
