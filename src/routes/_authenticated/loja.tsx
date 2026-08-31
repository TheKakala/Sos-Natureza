import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { ItemArt, toMotif } from "@/components/ItemArt";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/client";
import { RARITY } from "@/lib/sos";

export const Route = createFileRoute("/_authenticated/loja")({
  head: () => ({
    meta: [
      { title: "Loja Verde — SOS Natureza" },
      { name: "description", content: "Troque seus pontos por avatares, molduras e itens exclusivos." },
      { property: "og:title", content: "Loja Verde — SOS Natureza" },
      { property: "og:description", content: "Use seus pontos em itens exclusivos da Loja Verde." },
    ],
  }),
  component: LojaPage,
});

function LojaPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["shop-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_items")
        .select("id, name, category, icon, price, rarity")
        .order("price", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: owned } = useQuery({
    queryKey: ["inventory", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("item_id").eq("user_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map((row) => row.item_id));
    },
  });

  const buy = useMutation({
    mutationFn: async (item: { id: string; price: number; name: string }) => {
      const { data, error } = await supabase.rpc("purchase_item", { _item_id: item.id });
      if (error) throw error;
      const result = data as { ok: boolean; error?: string };
      if (!result?.ok) throw new Error(result?.error ?? "Não foi possível comprar este item.");
      return item.name;
    },
    onSuccess: (name) => {
      toast.success(`${name} adquirido!`);
      void queryClient.invalidateQueries({ queryKey: ["inventory", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell
      title="Loja Verde"
      subtitle={`${profile?.points ?? 0} pontos disponíveis`}
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-leaf-deep" aria-hidden="true" />
        </div>
      ) : (items?.length ?? 0) === 0 ? (
        <EmptyState icon={ShoppingBag} title="Loja vazia" description="Novos itens chegam em breve." />
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {items!.map((item) => {
            const has = owned?.has(item.id) ?? false;
            const rarity = RARITY[item.rarity] ?? RARITY["comum"]!;
            return (
              <li key={item.id} className="surface-card flex flex-col gap-2 p-4">
                <ItemArt motif={toMotif(item.icon)} price={item.price} className="h-20 w-20 self-center" />
                <p className="text-sm font-bold leading-tight">{item.name}</p>
                <span className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-bold ${rarity.className}`}>
                  {rarity.label}
                </span>
                <button
                  type="button"
                  disabled={has || buy.isPending}
                  onClick={() => buy.mutate(item)}
                  className="mt-auto rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
                >
                  {has ? "Adquirido" : `${item.price} pontos`}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
