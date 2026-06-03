export type Category = {
  id: string;
  label: string;
  colorClass: string;
};

export const TASK_CATEGORIES: Category[] = [
  { id: "trabalho", label: "Trabalho", colorClass: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { id: "casa", label: "Casa", colorClass: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { id: "saude", label: "Saúde", colorClass: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  { id: "projetos", label: "Projetos", colorClass: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: "estudo", label: "Estudo", colorClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { id: "compras", label: "Compras", colorClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { id: "diversos", label: "Diversos", colorClass: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
];

export function getCategory(id?: string | null): Category | undefined {
  if (!id) return undefined;
  return TASK_CATEGORIES.find(c => c.id === id);
}
