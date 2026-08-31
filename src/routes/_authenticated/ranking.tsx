import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Medal } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/client";
import { useAuth } from "@/hooks/useAuth";
import { rankForXp } from "@/lib/sos";

export const Route = createFileRoute("/_authenticated/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking — SOS Natureza" },
      { name: "description", content: "Ranking geral, semanal e mensal dos cidadãos mais atuantes." },
      { property: "og:title", content: "Ranking — SOS Natureza" },
      { property: "og:description", content: "Veja os cidadãos que mais cuidam da cidade." },
    ],
  }),
  component: RankingPage,
});

const TABS = [
  { id: "geral", label: "Geral" },
  { id: "mensal", label: "Mensal" },
  { id: "semanal", label: "Semanal" },
] as const;

function since(tab: (typeof TABS)[number]["id"]) {
  const now = new Date();
  if (tab === "semanal") return new Date(now.getTime() - 7 * 864e5).toISOString();
  if (tab === "mensal") return new Date(now.getTime() - 30 * 864e5).toISOString();
  return null;
}

function RankingPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("geral");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ranking", tab],
    queryFn: async () => {
      if (tab === "geral") {
        const { data: rows, error } = await supabase
          .from("leaderboard")
          .select("id, username, points, xp")
          .order("xp", { ascending: false })
          .limit(50);
        if (error) throw error;
        return (rows ?? []).map((row) => ({ id: row.id!, username: row.username!, points: row.points ?? 0, xp: row.xp ?? 0 }));
      }
      const from = since(tab)!;
      const { data: rows, error } = await supabase
        .from("point_transactions")
        .select("user_id, xp")
        .gte("created_at", from);
      if (error) throw error;
      const totals = new Map<string, number>();
      (rows ?? []).forEach((row) => totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + (row.xp ?? 0)));
      const ids = [...totals.keys()];
      if (ids.length === 0) return [];
      const { data: people } = await supabase.from("leaderboard").select("id, username").in("id", ids);
      return ids
        .map((id) => ({
          id,
          username: people?.find((person) => person.id === id)?.username ?? "usuario",
          points: totals.get(id) ?? 0,
          xp: totals.get(id) ?? 0,
        }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 50);
    },
  });

  return (
    <AppShell title="Ranking" subtitle="Somente nome público, rank e pontos">
      <div className="mb-4 flex gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={`flex-1 rounded-full border px-3 py-2 text-xs font-bold ${
              tab === item.id ? "border-primary bg-primary/25 text-leaf-deep" : "border-border bg-card"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-leaf-deep" aria-hidden="true" />
        </div>
      ) : isError ? (
        <p role="alert" className="surface-card p-4 text-sm">
          Não foi possível carregar os dados. Tente novamente.
        </p>
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Medal}
          title="Ranking ainda vazio"
          description="Ainda não existem dados suficientes para gerar esta estatística."
        />
      ) : (
        <ol className="space-y-2">
          {data!.map((row, index) => {
            const isMe = row.id === user?.id;
            return (
              <li
                key={row.id}
                className={`flex items-center gap-3 rounded-2xl border p-3 ${
                  isMe ? "border-primary bg-primary/15" : "border-border bg-card"
                }`}
              >
                <span className="w-7 text-center text-lg font-extrabold text-leaf-deep">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">
                    @{row.username} {isMe ? <span className="text-xs font-semibold">(você)</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{rankForXp(row.xp).current.name}</p>
                </div>
                <span className="rounded-full bg-surface px-3 py-1 text-sm font-bold">{row.points} pts</span>
              </li>
            );
          })}
        </ol>
      )}
    </AppShell>
  );
}
