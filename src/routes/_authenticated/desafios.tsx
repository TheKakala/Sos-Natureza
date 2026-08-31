import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Loader2, Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/desafios")({
  head: () => ({
    meta: [
      { title: "Desafios — SOS Natureza" },
      { name: "description", content: "Participe dos desafios ambientais e ganhe pontos extras." },
      { property: "og:title", content: "Desafios — SOS Natureza" },
      { property: "og:description", content: "Complete desafios ambientais e ganhe recompensas." },
    ],
  }),
  component: ChallengesPage,
});

function ChallengesPage() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["challenges", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const [catalog, mine] = await Promise.all([
        supabase.from("challenges").select("*"),
        supabase.from("user_challenges").select("challenge_id, progress, completed_at").eq("user_id", user!.id),
      ]);
      if (catalog.error) throw catalog.error;
      return { catalog: catalog.data ?? [], mine: mine.data ?? [] };
    },
  });

  return (
    <AppShell title="Desafios" subtitle="Participe e ganhe recompensas">
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-leaf-deep" aria-hidden="true" />
        </div>
      ) : isError ? (
        <p role="alert" className="surface-card p-4 text-sm">
          Não foi possível carregar os dados. Tente novamente.
        </p>
      ) : (
        <ul className="space-y-3">
          {(data?.catalog ?? []).map((challenge) => {
            const progressRow = data?.mine.find((item) => item.challenge_id === challenge.id);
            const progress = progressRow?.progress ?? 0;
            const percent = Math.min(100, Math.round((progress / challenge.goal) * 100));
            return (
              <li key={challenge.id} className="surface-card p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-leaf-deep">
                    <Target className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <p className="font-bold">{challenge.title}</p>
                    <p className="text-xs text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
                <Progress value={percent} className="mt-3 h-2" />
                <p className="mt-1 flex justify-between text-xs font-semibold">
                  <span>
                    {progress}/{challenge.goal} concluído
                  </span>
                  <span>+{challenge.reward_points} pontos</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        to="/dicas"
        className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-leaf-deep/30 bg-card p-4 text-sm font-bold"
      >
        <BookOpen className="h-5 w-5 text-leaf-deep" aria-hidden="true" />
        Abrir conteúdos educativos e contar seu tempo de leitura
      </Link>

      <p className="mt-6 rounded-xl bg-surface p-3 text-xs text-muted-foreground">
        Denuncie apenas problemas reais. Denúncias falsas não geram pontos e podem ser marcadas como inválidas.
      </p>
    </AppShell>
  );
}
