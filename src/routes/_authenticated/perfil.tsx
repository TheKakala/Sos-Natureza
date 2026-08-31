import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Pencil } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { UserAvatar } from "@/components/UserAvatar";
import { Progress } from "@/components/ui/progress";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/client";
import { formatDate, rankForXp } from "@/lib/sos";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — SOS Natureza" },
      { name: "description", content: "Seus dados, rank, itens adquiridos e configurações da conta." },
      { property: "og:title", content: "Perfil — SOS Natureza" },
      { property: "og:description", content: "Veja seu rank, itens e configurações." },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ["inventory-items", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("id, item_id, shop_items(name, icon)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const xp = profile?.xp ?? 0;
  const rank = rankForXp(xp);

  return (
    <AppShell title="Perfil" subtitle="Sua conta no SOS Natureza">
      <section className="surface-card flex items-center gap-3 p-4">
        <UserAvatar value={profile?.avatar_url} className="h-16 w-16" />
        <div className="min-w-0">
          <p className="truncate text-base font-bold">{profile?.full_name || "Cidadão(ã)"}</p>
          <p className="truncate text-xs text-muted-foreground">@{profile?.username ?? "usuario"}</p>
          <p className="truncate text-xs text-muted-foreground">Membro desde {formatDate(profile?.created_at)}</p>
        </div>
      </section>

      <section className="gradient-leaf mt-4 rounded-2xl p-4 text-primary-foreground shadow-glow">
        <p className="text-xs font-bold uppercase tracking-wide opacity-80">Rank atual</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">{rank.current.name}</h2>
          <span className="rounded-full bg-background/70 px-3 py-1 text-sm font-bold text-leaf-deep">{xp} XP</span>
        </div>
        <Progress value={rank.progress} className="mt-3 h-2.5 bg-background/50" />
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="surface-card p-4">
          <p className="text-2xl font-extrabold text-leaf-deep">{profile?.points ?? 0}</p>
          <p className="text-xs font-semibold text-muted-foreground">Pontos</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-2xl font-extrabold text-leaf-deep">{items?.length ?? 0}</p>
          <p className="text-xs font-semibold text-muted-foreground">Itens adquiridos</p>
        </div>
      </section>

      {items && items.length > 0 ? (
        <section className="mt-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Meus itens</h2>
          <ul className="flex flex-wrap gap-2">
            {items.map((row) => (
              <li key={row.id} className="surface-card flex items-center gap-2 px-3 py-2 text-sm font-semibold">
                <span aria-hidden="true">{row.shop_items?.icon}</span>
                {row.shop_items?.name ?? row.item_id}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        to="/editar-perfil"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-leaf-deep/30 bg-card px-4 py-3 text-sm font-bold"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        Editar perfil
      </Link>

      <button
        type="button"
        onClick={async () => {
          await queryClient.cancelQueries();
          queryClient.clear();
          await supabase.auth.signOut();
          void navigate({ to: "/" });
        }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-bold text-foreground"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sair da conta
      </button>
    </AppShell>
  );
}
