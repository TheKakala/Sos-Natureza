import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MapCanvas } from "@/components/MapCanvas";
import { StorageImage } from "@/components/StorageImage";
import { supabase } from "@/integrations/client";
import { categoryLabel, formatDate, STATUS, STATUS_ORDER, type ReportStatus } from "@/lib/sos";

export const Route = createFileRoute("/_authenticated/denuncia/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes da denúncia — SOS Natureza" },
      { name: "description", content: "Veja o andamento, o local e a solução da sua denúncia ambiental." },
      { property: "og:title", content: "Detalhes da denúncia — SOS Natureza" },
      { property: "og:description", content: "Acompanhe o andamento da denúncia." },
    ],
  }),
  component: ReportDetail,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-6 text-sm">Denúncia não encontrada.</div>,
});

function ReportDetail() {
  const { id } = Route.useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const { data: report, error } = await supabase.from("reports").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      const { data: events } = await supabase
        .from("report_events")
        .select("id, status, note, created_at")
        .eq("report_id", id)
        .order("created_at", { ascending: true });
      return { report, events: events ?? [] };
    },
  });

  if (isLoading) {
    return (
      <AppShell title="Denúncia">
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-leaf-deep" aria-hidden="true" />
        </div>
      </AppShell>
    );
  }

  if (isError || !data?.report) {
    return (
      <AppShell title="Denúncia">
        <p role="alert" className="surface-card p-4 text-sm">
          Não foi possível carregar os dados. Tente novamente.
        </p>
      </AppShell>
    );
  }

  const report = data.report;
  const status = STATUS[report.status as ReportStatus];

  return (
    <AppShell title={report.protocol} subtitle={categoryLabel(report.category)}>
      <Link to="/minhas-denuncias" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Minhas denúncias
      </Link>

      <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}>
        Status: {status.label}
      </span>

      <StorageImage path={report.image_url} alt="Foto enviada na denúncia" className="mt-3 h-52 w-full rounded-2xl" />

      <dl className="surface-card mt-3 space-y-3 p-4 text-sm">
        <div>
          <dt className="font-semibold text-muted-foreground">Descrição</dt>
          <dd>{report.description || "—"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-muted-foreground">Local</dt>
          <dd>{report.location_text || "Não informado"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-muted-foreground">Registrada em</dt>
          <dd>{formatDate(report.created_at)}</dd>
        </div>
      </dl>

      {report.latitude && report.longitude ? (
        <div className="mt-3 h-48 overflow-hidden rounded-2xl border border-border">
          <MapCanvas
            center={[report.latitude, report.longitude]}
            zoom={16}
            markers={[{ id: report.id, lat: report.latitude, lon: report.longitude, title: report.protocol }]}
          />
        </div>
      ) : null}

      <section className="mt-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Linha do tempo</h2>
        <ol className="surface-card space-y-3 p-4">
          {STATUS_ORDER.map((key) => {
            const event = data.events.find((item) => item.status === key);
            return (
              <li key={key} className="flex gap-3">
                <span
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ${event ? "bg-primary" : "bg-border"}`}
                  aria-hidden="true"
                />
                <div className="text-sm">
                  <p className={`font-bold ${event ? "" : "text-muted-foreground"}`}>{STATUS[key].label}</p>
                  <p className="text-xs text-muted-foreground">
                    {event ? formatDate(event.created_at) : "Aguardando"}
                    {event?.note ? ` · ${event.note}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {report.status === "concluida" ? (
        <section className="surface-card mt-4 space-y-2 p-4">
          <h2 className="text-base font-bold">Solução da Prefeitura</h2>
          <p className="text-sm">{report.admin_note || "Atendimento realizado."}</p>
          <p className="text-xs text-muted-foreground">Concluída em {formatDate(report.resolved_at)}</p>
          <StorageImage path={report.resolution_image_url} alt="Foto após o atendimento" className="h-48 w-full rounded-xl" />
        </section>
      ) : null}
    </AppShell>
  );
}
