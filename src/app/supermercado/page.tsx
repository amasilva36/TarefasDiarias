"use client";

import { useMarket } from "@/lib/store";
import { MarketForm } from "@/components/MarketForm";
import { MarketItemView } from "@/components/MarketItem";
import { MARKET_CATEGORIES, MarketItem } from "@/lib/storage";
import { Trash2, RefreshCcw, ArrowDownAZ } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function SupermercadoPage() {
  const { items, clearBought, clearAll, reorderItems, isLoaded } = useMarket();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );

  const handleClearAll = () => {
    if (confirm("Tem a certeza que quer apagar toda a lista?")) clearAll();
  };

  const boughtCount = items.filter((i) => i.bought).length;
  const totalCount = items.length;

  const groupedItems = MARKET_CATEGORIES.map((category) => {
    const catItems = items
      .filter((i) => i.category === category)
      .sort((a, b) => {
        // bought items always go to the bottom
        if (a.bought !== b.bought) return a.bought ? 1 : -1;
        return a.orderIndex - b.orderIndex;
      });
    return { category, items: catItems };
  }).filter((group) => group.items.length > 0);

  const handleDragEnd = (event: DragEndEvent, categoryItems: MarketItem[]) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoryItems.findIndex((i) => i.id === active.id);
    const newIndex = categoryItems.findIndex((i) => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Build reordered array and assign new orderIndex values
    const reordered = [...categoryItems];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updates = reordered.map((item, idx) => ({
      id: item.id,
      orderIndex: idx,
    }));

    reorderItems(updates);
  };

  const handleResetOrder = () => {
    // Sort all items alphabetically within each category and reassign orderIndex
    const updates: { id: string; orderIndex: number }[] = [];
    MARKET_CATEGORIES.forEach((category) => {
      const catItems = items
        .filter((i) => i.category === category)
        .sort((a, b) => a.title.localeCompare(b.title, "pt", { sensitivity: "base" }));
      catItems.forEach((item, idx) => {
        updates.push({ id: item.id, orderIndex: idx });
      });
    });
    if (updates.length > 0) reorderItems(updates);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="p-4 bg-card/50 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">
              Supermercado
            </h1>
            {totalCount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {boughtCount}/{totalCount} comprados
              </p>
            )}
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap justify-end">
              <button
                onClick={handleResetOrder}
                title="Ordenar alfabeticamente"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-primary border border-border rounded-lg hover:border-primary/50 transition-all"
              >
                <ArrowDownAZ className="w-3.5 h-3.5" /> A-Z
              </button>
              <button
                onClick={clearBought}
                disabled={boughtCount === 0}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-primary border border-border rounded-lg hover:border-primary/50 disabled:opacity-30 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 border border-border rounded-lg hover:border-destructive/50 transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Nova lista
              </button>
            </div>
          )}
        </div>
        {totalCount > 0 && (
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
              style={{ width: `${(boughtCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </div>

      <MarketForm />

      <div className="flex-1 pb-6">
        {groupedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl">🛒</span>
            </div>
            <p className="text-sm">A lista está vazia.</p>
          </div>
        ) : (
          groupedItems.map((group) => (
            <div key={group.category} className="mb-2">
              <div className="px-4 py-2 bg-muted/20 text-xs font-bold text-primary uppercase tracking-widest border-y border-border">
                {group.category}
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, group.items)}
              >
                <SortableContext
                  items={group.items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div>
                    {group.items.map((item) => (
                      <MarketItemView key={item.id} item={item} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
