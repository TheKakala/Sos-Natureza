import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { ItemArt, toMotif } from "@/components/ItemArt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FREE_AVATARS, avatarValueFor } from "@/components/UserAvatar";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/client";

export const Route = createFileRoute("/_authenticated/editar-perfil")({
  head: () => ({
    meta: [
      { title: "Editar perfil — SOS Natureza" },
      { name: "description", content: "Altere seu nome, nome de usuário e escolha um ícone de perfil." },
      { property: "og:title", content: "Editar perfil — SOS Natureza" },
      { property: "og:description", content: "Personalize seu perfil com ícones da natureza." },
    ],
  }),
  component: EditProfilePage,
});

const schema = z.object({
  fullName: z.string().trim().min(3, "Informe seu nome completo").max(120),
  username: z
    .string()
    .trim()
    .min(3, "O nome de usuário precisa de ao menos 3 caracteres")
    .max(24)
    .regex(/^[a-zA-Z0-9_.]+$/, "Use apenas letras, números, ponto ou _"),
});

function EditProfilePage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<string>(avatarValueFor("sprout"));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setUsername(profile.username ?? "");
    if (profile.avatar_url) setAvatar(profile.avatar_url);
  }, [profile]);

  const { data: shopAvatars } = useQuery({
    queryKey: ["shop-avatars", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const [catalog, owned] = await Promise.all([
        supabase.from("shop_items").select("id, name, icon, price").eq("category", "avatares").order("price"),
        supabase.from("inventory").select("item_id").eq("user_id", user!.id),
      ]);
      if (catalog.error) throw catalog.error;
      const ownedIds = new Set((owned.data ?? []).map((row) => row.item_id));
      return (catalog.data ?? []).map((item) => ({ ...item, owned: ownedIds.has(item.id) }));
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse({ fullName, username });
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: parsed.data.fullName, username: parsed.data.username, avatar_url: avatar })
        .eq("id", user!.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success("Perfil atualizado!");
      void queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      void navigate({ to: "/perfil" });
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  return (
    <AppShell title="Editar perfil" subtitle="Deixe sua conta com a sua cara">
      <div className="flex flex-col items-center gap-2">
        <ItemArt
          motif={toMotif(avatar.replace("preset:", ""))}
          price={shopAvatars?.find((item) => avatarValueFor(item.icon) === avatar)?.price ?? 0}
          className="h-24 w-24"
          label="Prévia do seu ícone de perfil"
        />
        <p className="text-xs text-muted-foreground">Prévia do seu ícone</p>
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nome completo</Label>
          <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-12 bg-card" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">Nome de usuário</Label>
          <Input id="username" value={username} onChange={(event) => setUsername(event.target.value)} className="h-12 bg-card" />
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Ícones gratuitos</h2>
        <ul className="grid grid-cols-4 gap-3">
          {FREE_AVATARS.map((item) => {
            const value = avatarValueFor(item.icon);
            const active = avatar === value;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setAvatar(value)}
                  aria-pressed={active}
                  className={`flex w-full flex-col items-center gap-1 rounded-2xl border-2 p-2 ${
                    active ? "border-primary bg-primary/15" : "border-border bg-card"
                  }`}
                >
                  <ItemArt motif={toMotif(item.icon)} className="h-12 w-12" />
                  <span className="text-[10px] font-bold">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Ícones da Loja Verde</h2>
        <ul className="grid grid-cols-3 gap-3">
          {(shopAvatars ?? []).map((item) => {
            const value = avatarValueFor(item.icon);
            const active = avatar === value;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={!item.owned}
                  onClick={() => setAvatar(value)}
                  aria-pressed={active}
                  className={`flex w-full flex-col items-center gap-1 rounded-2xl border-2 p-2 disabled:opacity-60 ${
                    active ? "border-primary bg-primary/15" : "border-border bg-card"
                  }`}
                >
                  <ItemArt motif={toMotif(item.icon)} price={item.price} className="h-14 w-14" />
                  <span className="text-[10px] font-bold leading-tight">{item.name}</span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                    {item.owned ? (
                      <>
                        <Check className="h-3 w-3" aria-hidden="true" /> Seu
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" aria-hidden="true" /> {item.price} pts
                      </>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {error ? (
        <p role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}

      <Button onClick={() => save.mutate()} disabled={save.isPending} className="mt-6 w-full rounded-2xl py-6 font-bold">
        {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        Salvar alterações
      </Button>
    </AppShell>
  );
}
