import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, ChevronDown, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import bannerImage from "@/assets/banner-cidade.jpg";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dicas")({
  head: () => ({
    meta: [
      { title: "Dicas ambientais — SOS Natureza" },
      { name: "description", content: "Conteúdos educativos sobre água, florestas, reciclagem, queimadas e lixo." },
      { property: "og:title", content: "Dicas ambientais — SOS Natureza" },
      { property: "og:description", content: "Aprenda atitudes simples que ajudam o meio ambiente." },
    ],
  }),
  component: TipsPage,
});

const CATEGORIES = [
  { id: "todas", label: "Todas" },
  { id: "agua", label: "Água" },
  { id: "florestas", label: "Florestas" },
  { id: "reciclagem", label: "Reciclagem" },
  { id: "queimadas", label: "Queimadas" },
  { id: "lixo", label: "Lixo" },
  { id: "sustentabilidade", label: "Sustentabilidade" },
] as const;

/** Segundos de leitura necessários para o conteúdo contar como lido. */
const READ_SECONDS = 15;

function TipsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>("todas");
  const [openId, setOpenId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const savingRef = useRef<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tips"],
    queryFn: async () => {
      const { data: rows, error } = await supabase.from("tips").select("*");
      if (error) throw error;
      return rows ?? [];
    },
  });

  const { data: readIds } = useQuery({
    queryKey: ["tip-reads", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data: rows, error } = await supabase.from("tip_reads").select("tip_id").eq("user_id", user!.id);
      if (error) throw error;
      return new Set((rows ?? []).map((row) => row.tip_id));
    },
  });

  // Conta o tempo de leitura enquanto um conteúdo está aberto.
  useEffect(() => {
    if (!openId) return;
    setSeconds(0);
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [openId]);

  useEffect(() => {
    if (!openId || !user || seconds < READ_SECONDS) return;
    if (readIds?.has(openId) || savingRef.current === openId) return;
    savingRef.current = openId;
    const tipId = openId;
    void supabase
      .from("tip_reads")
      .insert({ user_id: user.id, tip_id: tipId, seconds })
      .then(({ error }) => {
        if (error) {
          savingRef.current = null;
          return;
        }
        toast.success("Leitura concluída! Progresso registrado.");
        void queryClient.invalidateQueries({ queryKey: ["tip-reads", user.id] });
        void queryClient.invalidateQueries({ queryKey: ["challenges", user.id] });
        void queryClient.invalidateQueries({ queryKey: ["achievements", user.id] });
        void queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      });
  }, [openId, seconds, user, readIds, queryClient]);

  const filtered = (data ?? []).filter((tip) => category === "todas" || tip.category === category);
  const readCount = readIds?.size ?? 0;

  return (
    <AppShell title="Dicas ambientais" subtitle={`${readCount} conteúdos lidos`}>
      <img
        src={bannerImage}
        alt="Ilustração de uma cidade sustentável com árvores e rio limpo"
        width={1280}
        height={640}
        loading="lazy"
        className="mb-4 w-full rounded-2xl border border-border object-cover"
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            aria-pressed={category === item.id}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${
              category === item.id ? "border-primary bg-primary/25 text-leaf-deep" : "border-border bg-card"
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
      ) : (
        <ul className="space-y-3">
          {filtered.map((tip) => {
            const open = openId === tip.id;
            const alreadyRead = readIds?.has(tip.id) ?? false;
            const left = Math.max(0, READ_SECONDS - seconds);
            return (
              <li key={tip.id} className="surface-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : tip.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-2 p-4 text-left"
                >
                  <BookOpen className="h-4 w-4 shrink-0 text-leaf-deep" aria-hidden="true" />
                  <span className="flex-1 font-bold">{tip.title}</span>
                  {alreadyRead ? (
                    <CheckCircle2 className="h-4 w-4 text-success" aria-label="Conteúdo já lido" />
                  ) : null}
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {open ? (
                  <div className="space-y-3 px-4 pb-4">
                    <p className="text-sm text-muted-foreground">{tip.body}</p>
                    <p className="rounded-xl bg-primary/15 p-3 text-sm font-semibold">
                      Dica prática: {tip.practical_tip}
                    </p>
                    <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {alreadyRead
                        ? `Você leu este conteúdo. Tempo nesta leitura: ${seconds}s`
                        : left > 0
                          ? `Tempo de leitura: ${seconds}s — faltam ${left}s para concluir`
                          : "Leitura concluída!"}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
