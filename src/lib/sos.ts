import {
  Trash2,
  Flame,
  Droplets,
  Trees,
  Waves,
  Leaf,
  type LucideIcon,
} from "lucide-react";

export type CategoryId = "lixo" | "queimada" | "agua" | "desmatamento" | "esgoto" | "outros";

export const CATEGORIES: {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  hint: string;
}[] = [
  { id: "lixo", label: "Descarte irregular de lixo", icon: Trash2, hint: "Entulho, lixo em terreno baldio" },
  { id: "queimada", label: "Queimada", icon: Flame, hint: "Fogo em mato, lixo ou terreno" },
  { id: "agua", label: "Poluição da água", icon: Droplets, hint: "Rio, córrego ou lago poluído" },
  { id: "desmatamento", label: "Desmatamento", icon: Trees, hint: "Corte irregular de árvores" },
  { id: "esgoto", label: "Esgoto a céu aberto", icon: Waves, hint: "Esgoto correndo na via" },
  { id: "outros", label: "Outros", icon: Leaf, hint: "Outro problema ambiental" },
];

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? "Outros";
}

export function categoryIcon(id: string): LucideIcon {
  return CATEGORIES.find((c) => c.id === id)?.icon ?? Leaf;
}

export type ReportStatus = "nova" | "em_analise" | "em_atendimento" | "concluida" | "cancelada";

export const STATUS: Record<ReportStatus, { label: string; className: string }> = {
  nova: { label: "Nova", className: "bg-surface text-foreground border-border" },
  em_analise: { label: "Em análise", className: "bg-warning/20 text-foreground border-warning/50" },
  em_atendimento: { label: "Em atendimento", className: "bg-info/15 text-foreground border-info/50" },
  concluida: { label: "Concluída", className: "bg-success/20 text-foreground border-success/60" },
  cancelada: { label: "Cancelada / Inválida", className: "bg-destructive/15 text-foreground border-destructive/40" },
};

export const STATUS_ORDER: ReportStatus[] = ["nova", "em_analise", "em_atendimento", "concluida"];

export type Rank = { level: number; name: string; min: number; max: number; emojiName: string };

export const RANKS: Rank[] = [
  { level: 1, name: "Semente Verde", min: 0, max: 99, emojiName: "sprout" },
  { level: 2, name: "Broto Ambiental", min: 100, max: 249, emojiName: "leaf" },
  { level: 3, name: "Protetor da Natureza", min: 250, max: 499, emojiName: "shield" },
  { level: 4, name: "Guardião Verde", min: 500, max: 999, emojiName: "trees" },
  { level: 5, name: "Defensor Ambiental", min: 1000, max: 1999, emojiName: "bug" },
  { level: 6, name: "Cidadão do Planeta", min: 2000, max: 3499, emojiName: "globe" },
  { level: 7, name: "Sentinela da Natureza", min: 3500, max: 5999, emojiName: "shield-check" },
  { level: 8, name: "Herói Ambiental", min: 6000, max: 9999, emojiName: "trophy" },
  { level: 9, name: "Líder Verde", min: 10000, max: 19999, emojiName: "crown" },
  { level: 10, name: "Lenda da Natureza", min: 20000, max: Number.MAX_SAFE_INTEGER, emojiName: "sparkles" },
];

export function rankForXp(xp: number) {
  const current = RANKS.filter((r) => xp >= r.min).at(-1) ?? RANKS[0]!;
  const next = RANKS.find((r) => r.level === current.level + 1) ?? null;
  const span = next ? next.min - current.min : 1;
  const progress = next ? Math.min(100, Math.round(((xp - current.min) / span) * 100)) : 100;
  return { current, next, progress, toNext: next ? Math.max(0, next.min - xp) : 0 };
}

export const RARITY: Record<string, { label: string; className: string }> = {
  comum: { label: "Comum", className: "bg-surface text-foreground border-border" },
  raro: { label: "Raro", className: "bg-info/15 text-foreground border-info/40" },
  epico: { label: "Épico", className: "bg-primary/25 text-foreground border-primary/60" },
  lendario: { label: "Lendário", className: "bg-warning/25 text-foreground border-warning/60" },
};

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
