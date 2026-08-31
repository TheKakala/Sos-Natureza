import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Camera,
  ClipboardList,
  MapPinned,
  Medal,
  ShieldCheck,
  ShoppingBag,
  Target,
  Trophy,
} from "lucide-react";
import bannerImage from "@/assets/banner-cidade.jpg";
import { AppShell } from "@/components/AppShell";
import { UserAvatar } from "@/components/UserAvatar";
import { Progress } from "@/components/ui/progress";
import { useAuth, useIsAdmin, useProfile } from "@/hooks/useAuth";
import { rankForXp } from "@/lib/sos";
import { supabase } from "@/integrations/client";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Início — SOS Natureza" },
      { name: "description", content: "Seu painel: rank, pontos, denúncias e atalhos do SOS Natureza." },
      { property: "og:title", content: "Início — SOS Natureza" },
      { property: "og:description", content: "Acompanhe seu rank, pontos e denúncias ambientais." },
    ],
  }),
  component: HomePage,
});

const SHORTCUTS = [
  { to: "/denunciar", label: "Fazer denúncia", icon: Camera },
  { to: "/mapa", label: "Mapa", icon: MapPinned },
  { to: "/minhas-denuncias", label: "Histórico de denúncias", icon: ClipboardList },
  { to: "/conquistas", label: "Conquistas", icon: Trophy },
  { to: "/desafios", label: "Desafios", icon: Target },
  { to: "/loja", label: "Loja Verde", icon: ShoppingBag },
  { to: "/dicas", label: "Dicas ambientais", icon: BookOpen },
  { to: "/ranking", label: "Ranking", icon: Medal },
] as const;

function HomePage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();

  const { data: counts } = useQuery({
    queryKey: ["home-counts", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const [total, done] = await Promise.all([
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .eq("status", "concluida"),
      ]);
      return { total: total.count ?? 0, done: done.count ?? 0 };
    },
  });

  const xp = profile?.xp ?? 0;
  const rank = rankForXp(xp);

  return (
    <AppShell title="Início">
      <section className="surface-card flex items-center gap-3 p-4">
        <UserAvatar value={profile?.avatar_url} className="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{profile?.full_name || "Cidadão(ã)"}</p>
          <p className="truncate text-xs text-muted-foreground">@{profile?.username ?? "usuario"}</p>
        </div>
        <div className="rounded-xl bg-primary/20 px-3 py-2 text-center">
          <p className="text-lg font-extrabold leading-none text-leaf-deep">{profile?.points ?? 0}</p>
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">pontos</p>
        </div>
      </section>

      <section className="gradient-leaf mt-4 rounded-2xl p-4 text-primary-foreground shadow-glow">
        <p className="text-xs font-bold uppercase tracking-wide opacity-80">Seu rank</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">{rank.current.name}</h2>
          <span className="rounded-full bg-background/70 px-3 py-1 text-sm font-bold text-leaf-deep">{xp} XP</span>
        </div>
        <Progress value={rank.progress} className="mt-3 h-2.5 bg-background/50" />
        <p className="mt-2 text-xs font-semibold">
          {rank.next
            ? `Faltam ${rank.toNext} XP para ${rank.next.name}`
            : "Você alcançou o rank máximo. Parabéns!"}
        </p>
      </section>

      {isAdmin ? (
        <Link
          to="/admin"
          className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-leaf-deep/30 bg-card p-4 font-bold"
        >
          <ShieldCheck className="h-5 w-5 text-leaf-deep" aria-hidden="true" />
          Painel administrativo da Prefeitura
        </Link>
      ) : null}

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Atalhos</h2>
        <ul className="grid grid-cols-2 gap-3">
          {SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link to={item.to} className="surface-card flex h-full flex-col gap-2 p-4 text-sm font-bold">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-leaf-deep">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="surface-card p-4">
          <p className="text-2xl font-extrabold text-leaf-deep">{counts?.total ?? 0}</p>
          <p className="text-xs font-semibold text-muted-foreground">Denúncias enviadas</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-2xl font-extrabold text-leaf-deep">{counts?.done ?? 0}</p>
          <p className="text-xs font-semibold text-muted-foreground">Problemas resolvidos</p>
        </div>
      </section>

      <img
        src={bannerImage}
        alt="Ilustração de uma cidade sustentável com árvores, rio limpo e pessoas cuidando do ambiente"
        width={1280}
        height={640}
        loading="lazy"
        className="mt-5 w-full rounded-2xl border border-border object-cover"
      />
    </AppShell>
  );
}
