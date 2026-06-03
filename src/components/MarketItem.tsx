"use client";

import { Check, Trash2, GripVertical } from "lucide-react";
import { MarketItem } from "@/lib/storage";
import { useMarket } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function MarketItemView({ item }: { item: MarketItem }) {
  const { updateItem, removeItem } = useMarket();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 border-b border-border bg-card/40 backdrop-blur-sm hover:bg-card/80 transition-all",
        item.bought && "opacity-50",
        isDragging && "opacity-90 shadow-xl shadow-primary/20 z-50 bg-card/95 border border-primary/30 rounded-lg scale-[1.02]"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 -ml-1 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none transition-colors"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Checkbox */}
      <button
        onClick={() => updateItem(item.id, { bought: !item.bought })}
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
          item.bought
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground hover:border-primary"
        )}
      >
        {item.bought && <Check className="w-3 h-3" />}
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm truncate transition-all",
            item.bought && "line-through text-muted-foreground"
          )}
        >
          {item.title}
        </p>
      </div>

      {/* Delete */}
      <button
        onClick={() => removeItem(item.id)}
        className="p-2 text-muted-foreground hover:text-destructive rounded-full transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
