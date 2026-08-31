import { t as supabase } from "./client-C8NJlSke.js";
import { i as useAuth, o as useProfile } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { t as EmptyState } from "./EmptyState-BvU2HfYM.js";
import { n as RARITY } from "./sos-CS-s4mgb.js";
import { n as toMotif, t as ItemArt } from "./ItemArt-DqtzmCsi.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ShoppingBag } from "lucide-react";
//#region src/routes/_authenticated/loja.tsx?tsr-split=component
function LojaPage() {
	const { user } = useAuth();
	const { data: profile } = useProfile();
	const queryClient = useQueryClient();
	const { data: items, isLoading } = useQuery({
		queryKey: ["shop-items"],
		queryFn: async () => {
			const { data, error } = await supabase.from("shop_items").select("id, name, category, icon, price, rarity").order("price", { ascending: true });
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: owned } = useQuery({
		queryKey: ["inventory", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { data, error } = await supabase.from("inventory").select("item_id").eq("user_id", user.id);
			if (error) throw error;
			return new Set((data ?? []).map((row) => row.item_id));
		}
	});
	const buy = useMutation({
		mutationFn: async (item) => {
			const { data, error } = await supabase.rpc("purchase_item", { _item_id: item.id });
			if (error) throw error;
			const result = data;
			if (!result?.ok) throw new Error(result?.error ?? "Não foi possível comprar este item.");
			return item.name;
		},
		onSuccess: (name) => {
			toast.success(`${name} adquirido!`);
			queryClient.invalidateQueries({ queryKey: ["inventory", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
		},
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ jsx(AppShell, {
		title: "Loja Verde",
		subtitle: `${profile?.points ?? 0} pontos disponíveis`,
		children: isLoading ? /* @__PURE__ */ jsx("div", {
			className: "flex justify-center py-10",
			children: /* @__PURE__ */ jsx(Loader2, {
				className: "h-6 w-6 animate-spin text-leaf-deep",
				"aria-hidden": "true"
			})
		}) : (items?.length ?? 0) === 0 ? /* @__PURE__ */ jsx(EmptyState, {
			icon: ShoppingBag,
			title: "Loja vazia",
			description: "Novos itens chegam em breve."
		}) : /* @__PURE__ */ jsx("ul", {
			className: "grid grid-cols-2 gap-3",
			children: items.map((item) => {
				const has = owned?.has(item.id) ?? false;
				const rarity = RARITY[item.rarity] ?? RARITY["comum"];
				return /* @__PURE__ */ jsxs("li", {
					className: "surface-card flex flex-col gap-2 p-4",
					children: [
						/* @__PURE__ */ jsx(ItemArt, {
							motif: toMotif(item.icon),
							price: item.price,
							className: "h-20 w-20 self-center"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm font-bold leading-tight",
							children: item.name
						}),
						/* @__PURE__ */ jsx("span", {
							className: `w-fit rounded-full border px-2 py-0.5 text-[10px] font-bold ${rarity.className}`,
							children: rarity.label
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							disabled: has || buy.isPending,
							onClick: () => buy.mutate(item),
							className: "mt-auto rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50",
							children: has ? "Adquirido" : `${item.price} pontos`
						})
					]
				}, item.id);
			})
		})
	});
}
//#endregion
export { LojaPage as component };
