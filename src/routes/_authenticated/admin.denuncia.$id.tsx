import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { StorageImage } from "@/components/StorageImage";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { supabase } from "@/integrations/client";
import { categoryLabel, formatDate, STATUS, STATUS_ORDER, type ReportStatus } from "@/lib/sos";

export const Route = createFileRoute("/_authenticated/admin/denuncia/$id")({
  head: () => ({
    meta: [
      { title: "Atualizar denúncia — SOS Natureza" },
      { name: "description", content: "Atualize o status, envie a foto da solução e registre observações." },
      { property: "og:title", content: "Atualizar denúncia — SOS Natureza" },
      { property: "og:description", content: "Gestão da denúncia ambiental pela Prefeitura." },
    ],
  }),
  component: AdminReportPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-6 text-sm">Denúncia não encontrada.</div>,
});

function AdminReportPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { data: isAdmin, isLoading: loadingRole } = useIsAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [status, setStatus] = useState<ReportStatus | "">("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-report", id],
    enabled: Boolean(isAdmin),
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

  const save = useMutation({
    mutationFn: async () => {
      const report = data?.report;
      if (!report) throw new Error("Denúncia não encontrada.");
      const nextStatus = (status || report.status) as ReportStatus;

      let resolutionPath = report.resolution_image_url as string | null;
      if (photo) {
        const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user!.id}/resolucao-${report.id}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("denuncias").upload(path, photo);
        if (uploadError) throw uploadError;
        resolutionPath = path;
      }

      const { error } = await supabase
        .from("reports")
        .update({
          status: nextStatus,
          admin_note: note.trim() ? note.trim() : report.admin_note,
          resolution_image_url: resolutionPath,
          resolved_at: nextStatus === "concluida" ? new Date().toISOString() : report.resolved_at,
        })
        .eq("id", report.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Denúncia atualizada com sucesso.");
      setPhoto(null);
      setNote("");
      void queryClient.invalidateQueries({ queryKey: ["admin-report", id] });
      void queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (error: Error) => toast.error(error.message || "Não foi possível atualizar."),
  });

  if (loadingRole || isLoading) {
    return (
      <AppShell title="Denúncia">
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-leaf-deep" aria-hidden="true" />
        </div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell title="Denúncia">
        <EmptyState
          icon={ShieldCheck}
          title="Acesso restrito"
          description="Esta área é exclusiva para contas da Prefeitura."
        />
      </AppShell>
    );
  }

  const report = data?.report;
  if (!report) {
    return (
      <AppShell title="Denúncia">
        <p role="alert" className="surface-card p-4 text-sm">
          Denúncia não encontrada.
        </p>
      </AppShell>
    );
  }

  const current = STATUS[report.status as ReportStatus];

  return (
    <AppShell title={report.protocol} subtitle={categoryLabel(report.category)}>
      <button
        type="button"
        onClick={() => navigate({ to: "/admin" })}
        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Painel
      </button>

      <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${current.className}`}>
        Status atual: {current.label}
      </span>

      <StorageImage path={report.image_url} alt="Foto enviada pelo cidadão" className="mt-3 h-52 w-full rounded-2xl" />

      <dl className="surface-card mt-3 space-y-2 p-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Local</dt>
          <dd className="font-semibold">{report.location_text || "Não informado"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Descrição</dt>
          <dd>{report.description || "Sem descrição"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Recebida em</dt>
          <dd>{formatDate(report.created_at)}</dd>
        </div>
      </dl>

      <section className="surface-card mt-3 space-y-3 p-4">
        <h2 className="text-sm font-bold">Atualizar denúncia</h2>

        <div>
          <label htmlFor="status" className="text-xs font-semibold text-muted-foreground">
            Novo status
          </label>
          <select
            id="status"
            value={status || report.status}
            onChange={(event) => setStatus(event.target.value as ReportStatus)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            {[...STATUS_ORDER, "cancelada" as const].map((item) => (
              <option key={item} value={item}>
                {STATUS[item].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="note" className="text-xs font-semibold text-muted-foreground">
            Observação para o cidadão
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Ex.: equipe de limpeza esteve no local e removeu o entulho."
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="resolution" className="text-xs font-semibold text-muted-foreground">
            Foto da solução (opcional)
          </label>
          <input
            id="resolution"
            type="file"
            accept="image/*"
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            className="mt-1 w-full text-xs"
          />
        </div>

        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="gradient-leaf w-full rounded-xl px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
        >
          {save.isPending ? "Salvando..." : "Salvar atualização"}
        </button>
      </section>

      {report.resolution_image_url ? (
        <section className="mt-3">
          <h2 className="mb-2 text-sm font-bold">Foto da solução</h2>
          <StorageImage
            path={report.resolution_image_url}
            alt="Foto da solução enviada pela Prefeitura"
            className="h-52 w-full rounded-2xl"
          />
        </section>
      ) : null}

      <section className="mt-4">
        <h2 className="mb-2 text-sm font-bold">Histórico</h2>
        <ul className="space-y-2">
          {data!.events.map((event) => (
            <li key={event.id} className="surface-card p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{STATUS[event.status as ReportStatus].label}</span>
                <span className="text-[11px] text-muted-foreground">{formatDate(event.created_at)}</span>
              </div>
              {event.note ? <p className="mt-1 text-xs text-muted-foreground">{event.note}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link to="/app" className="font-semibold">
          Voltar ao início
        </Link>
      </p>
    </AppShell>
  );
}
