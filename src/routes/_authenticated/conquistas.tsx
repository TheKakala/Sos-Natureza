import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { iconByName } from "@/lib/lucide-icon";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/sos";

export const Route = createFileRoute("/_authenticated/conquistas")({
  head: () => ({
    meta: [
      { title: "Conquistas — SOS Natureza" },
      { name: "description", content: "Veja suas 30 conquistas ambientais, requisitos e recompensas." },
      { property: "og:title", content: "Conquistas — SOS Natureza" },
      { property: "og:description", content: "Desbloqueie conquistas cuidando da sua cidade." },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["achievements", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const [catalog, mine] = await Promise.all([
        supabase.from("achievements").select("*").order("position"),
        supabase.from("user_achievements").select("achievement_id, unlocked_at").eq("user_id", user!.id),
      ]);
      if (catalog.error) throw catalog.error;
      return { catalog: catalog.data ?? [], mine: mine.data ?? [] };
    },
  });

  const unlocked = new Map((data?.mine ?? []).map((item) => [item.achievement_id, item.unlocked_at]));
  const total = data?.catalog.length ?? 0;
  const done = unlocked.size;

  return (
    <AppShell title="Conquistas" subtitle={`${done} de ${total} desbloqueadas`}>
      <Progress value={total ? (done / total) * 100 : 0} className="mb-4 h-2.5" />

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-leaf-deep" aria-hidden="true" />
        </div>
      ) : isError ? (
        <p role="alert" className="surface-card p-4 text-sm">
          Não foi possível carregar os dados. Tente novamente.
        </p>
      ) : (
        <ul className="space-y-2">
          {(data?.catalog ?? []).map((achievement) => {
            const when = unlocked.get(achievement.id);
            const isUnlocked = Boolean(when);
            return (
              <li
                key={achievement.id}
                className={`flex items-start gap-3 rounded-2xl border p-3 ${
                  isUnlocked ? "border-primary/60 bg-primary/10" : "border-border bg-card"
                }`}
              >
                <span
                  className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    isUnlocked ? "bg-primary/30 text-leaf-deep" : "bg-surface text-muted-foreground"
                  }`}
                >
                  {(() => {
                    const Icon = iconByName(achievement.icon);
                    return <Icon className="h-6 w-6" aria-hidden="true" />;
                  })()}
                  {!isUnlocked ? (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card">
                      <Lock className="h-3 w-3" aria-hidden="true" />
                    </span>
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  <p className="mt-1 text-[11px] font-semibold">
                    Recompensa: +{achievement.reward_points} pontos ·{" "}
                    {isUnlocked ? `Desbloqueada em ${formatDate(when!)}` : "Bloqueada"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
