import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { StorageImage } from "@/components/StorageImage";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/client";
import { useAuth } from "@/hooks/useAuth";
import { categoryLabel, formatDate, STATUS, type ReportStatus } from "@/lib/sos";

export const Route = createFileRoute("/_authenticated/minhas-denuncias")({
  head: () => ({
    meta: [
      { title: "Minhas denúncias — SOS Natureza" },
      { name: "description", content: "Acompanhe o status e o protocolo das denúncias que você registrou." },
      { property: "og:title", content: "Minhas denúncias — SOS Natureza" },
      { property: "og:description", content: "Acompanhe suas denúncias ambientais." },
    ],
  }),
  component: MyReportsPage,
});

const FILTERS = [
  { id: "todas", label: "Todas" },
  { id: "em_analise", label: "Em análise" },
  { id: "em_atendimento", label: "Em atendimento" },
  { id: "concluida", label: "Concluídas" },
] as const;

function MyReportsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("todas");

  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ["my-reports", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, protocol, category, status, image_url, location_text, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (reports ?? []).filter((report) => filter === "todas" || report.status === filter);

  return (
    <AppShell title="Histórico" subtitle="Acompanhe cada protocolo">
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            aria-pressed={filter === item.id}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${
              filter === item.id ? "border-primary bg-primary/25 text-leaf-deep" : "border-border bg-card"
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
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma denúncia por aqui"
          description="Quando você registrar um problema ambiental, ele aparece nesta lista com protocolo e status."
          action={
            <Button asChild className="mt-2 rounded-2xl px-6 font-bold">
              <Link to="/denunciar">Fazer denúncia</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((report) => {
            const status = STATUS[report.status as ReportStatus];
            return (
              <li key={report.id}>
                <Link
                  to="/denuncia/$id"
                  params={{ id: report.id }}
                  className="surface-card flex gap-3 overflow-hidden p-3"
                >
                  <StorageImage path={report.image_url} alt="Foto da denúncia" className="h-20 w-20 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{categoryLabel(report.category)}</p>
                    <p className="truncate text-xs text-muted-foreground">{report.location_text || "Local não informado"}</p>
                    <p className="mt-1 text-xs font-semibold">{report.protocol} · {formatDate(report.created_at)}</p>
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
