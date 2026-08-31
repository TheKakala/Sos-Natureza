import { t as supabase } from "./client-C8NJlSke.js";
import { i as useAuth } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { t as EmptyState } from "./EmptyState-BvU2HfYM.js";
import { o as formatDate } from "./sos-CS-s4mgb.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2 } from "lucide-react";
//#region src/routes/_authenticated/notificacoes.tsx?tsr-split=component
function NotificacoesPage() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const { data, isLoading } = useQuery({
		queryKey: ["notifications", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { data: rows, error } = await supabase.from("notifications").select("id, title, message, type, read, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
			if (error) throw error;
			return rows ?? [];
		}
	});
	const markAll = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["notifications-unread", user?.id] });
		}
	});
	return /* @__PURE__ */ jsx(AppShell, {
		title: "Notificações",
		subtitle: "Novidades sobre você",
		action: /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => markAll.mutate(),
			className: "rounded-full bg-surface px-3 py-2 text-xs font-bold text-foreground",
			children: "Marcar lidas"
		}),
		children: isLoading ? /* @__PURE__ */ jsx("div", {
			className: "flex justify-center py-10",
			children: /* @__PURE__ */ jsx(Loader2, {
				className: "h-6 w-6 animate-spin text-leaf-deep",
				"aria-hidden": "true"
			})
		}) : (data?.length ?? 0) === 0 ? /* @__PURE__ */ jsx(EmptyState, {
			icon: Bell,
			title: "Nada por aqui",
			description: "Suas atualizações aparecerão nesta tela."
		}) : /* @__PURE__ */ jsx("ul", {
			className: "space-y-3",
			children: data.map((n) => /* @__PURE__ */ jsxs("li", {
				className: `surface-card p-4 ${n.read ? "" : "border-2 border-primary/60"}`,
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-sm font-bold",
						children: n.title
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[11px] text-muted-foreground",
						children: formatDate(n.created_at)
					})]
				}), n.message ? /* @__PURE__ */ jsx("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: n.message
				}) : null]
			}, n.id))
		})
	});
}
//#endregion
export { NotificacoesPage as component };
