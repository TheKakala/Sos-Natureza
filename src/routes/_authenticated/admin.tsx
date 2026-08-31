import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { useIsAdmin } from "@/hooks/useAuth";
import { supabase } from "@/integrations/client";
import { STATUS, STATUS_ORDER, categoryLabel, formatDate, type ReportStatus } from "@/lib/sos";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel da Prefeitura — SOS Natureza" },
      { name: "description", content: "Gestão das denúncias ambientais recebidas pela Prefeitura." },
      { property: "og:title", content: "Painel da Prefeitura — SOS Natureza" },
      { property: "og:description", content: "Acompanhe e atualize as denúncias ambientais." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { data: isAdmin, isLoading: loadingRole } = useIsAdmin();
  const [filter, setFilter] = useState<ReportStatus | "todas">("todas");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports", filter],
    enabled: Boolean(isAdmin),
    queryFn: async () => {
      let query = supabase
        .from("reports")
        .select("id, protocol, category, status, location_text, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (filter !== "todas") query = query.eq("status", filter);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loadingRole) {
    return (
      <AppShell title="Painel">
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-leaf-deep" aria-hidden="true" />
        </div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell title="Painel">
        <EmptyState
          icon={ShieldCheck}
          title="Acesso restrito"
          description="Esta área é exclusiva para contas da Prefeitura."
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Painel da Prefeitura" subtitle="Denúncias recebidas">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["todas", ...STATUS_ORDER] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
              filter === item ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"
            }`}
          >
            {item === "todas" ? "Todas" : STATUS[item].label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-leaf-deep" aria-hidden="true" />
        </div>
      ) : (reports?.length ?? 0) === 0 ? (
        <EmptyState icon={ShieldCheck} title="Nenhuma denúncia" description="Nada encontrado para este filtro." />
      ) : (
        <ul className="mt-2 space-y-3">
          {reports!.map((report) => (
            <li key={report.id}>
              <Link to="/admin/denuncia/$id" params={{ id: report.id }} className="surface-card block p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">{report.protocol}</p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS[report.status].className}`}
                  >
                    {STATUS[report.status].label}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold">{categoryLabel(report.category)}</p>
                <p className="truncate text-xs text-muted-foreground">{report.location_text}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(report.created_at)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
