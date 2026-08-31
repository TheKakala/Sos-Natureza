import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/client";
import { formatDate } from "@/lib/sos";

export const Route = createFileRoute("/_authenticated/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações — SOS Natureza" },
      { name: "description", content: "Acompanhe atualizações das suas denúncias, conquistas e pontos." },
      { property: "og:title", content: "Notificações — SOS Natureza" },
      { property: "og:description", content: "Atualizações de denúncias, conquistas e pontos." },
    ],
  }),
  component: NotificacoesPage,
});

function NotificacoesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("notifications")
        .select("id, title, message, type, read, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return rows ?? [];
    },
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user!.id)
        .eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["notifications-unread", user?.id] });
    },
  });

  return (
    <AppShell
      title="Notificações"
      subtitle="Novidades sobre você"
      action={
        <button
          type="button"
          onClick={() => markAll.mutate()}
          className="rounded-full bg-surface px-3 py-2 text-xs font-bold text-foreground"
        >
          Marcar lidas
        </button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-leaf-deep" aria-hidden="true" />
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState icon={Bell} title="Nada por aqui" description="Suas atualizações aparecerão nesta tela." />
      ) : (
        <ul className="space-y-3">
          {data!.map((n) => (
            <li
              key={n.id}
              className={`surface-card p-4 ${n.read ? "" : "border-2 border-primary/60"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold">{n.title}</p>
                <span className="text-[11px] text-muted-foreground">{formatDate(n.created_at)}</span>
              </div>
              {n.message ? <p className="mt-1 text-sm text-muted-foreground">{n.message}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
