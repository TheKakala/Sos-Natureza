import { t as supabase } from "./client-C8NJlSke.js";
import { a as useIsAdmin } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { t as EmptyState } from "./EmptyState-BvU2HfYM.js";
import { a as categoryLabel, i as STATUS_ORDER, o as formatDate, r as STATUS } from "./sos-CS-s4mgb.js";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
//#region src/routes/_authenticated/admin.tsx?tsr-split=component
function AdminPage() {
	const { data: isAdmin, isLoading: loadingRole } = useIsAdmin();
	const [filter, setFilter] = useState("todas");
	const { data: reports, isLoading } = useQuery({
		queryKey: ["admin-reports", filter],
		enabled: Boolean(isAdmin),
		queryFn: async () => {
			let query = supabase.from("reports").select("id, protocol, category, status, location_text, created_at").order("created_at", { ascending: false }).limit(100);
			if (filter !== "todas") query = query.eq("status", filter);
			const { data, error } = await query;
			if (error) throw error;
			return data ?? [];
		}
	});
	if (loadingRole) return /* @__PURE__ */ jsx(AppShell, {
		title: "Painel",
		children: /* @__PURE__ */ jsx("div", {
			className: "flex justify-center py-10",
			children: /* @__PURE__ */ jsx(Loader2, {
				className: "h-6 w-6 animate-spin text-leaf-deep",
				"aria-hidden": "true"
			})
		})
	});
	if (!isAdmin) return /* @__PURE__ */ jsx(AppShell, {
		title: "Painel",
		children: /* @__PURE__ */ jsx(EmptyState, {
			icon: ShieldCheck,
			title: "Acesso restrito",
			description: "Esta área é exclusiva para contas da Prefeitura."
		})
	});
	return /* @__PURE__ */ jsxs(AppShell, {
		title: "Painel da Prefeitura",
		subtitle: "Denúncias recebidas",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex gap-2 overflow-x-auto pb-2",
			children: ["todas", ...STATUS_ORDER].map((item) => /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setFilter(item),
				className: `shrink-0 rounded-full px-3 py-2 text-xs font-bold ${filter === item ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"}`,
				children: item === "todas" ? "Todas" : STATUS[item].label
			}, item))
		}), isLoading ? /* @__PURE__ */ jsx("div", {
			className: "flex justify-center py-10",
			children: /* @__PURE__ */ jsx(Loader2, {
				className: "h-6 w-6 animate-spin text-leaf-deep",
				"aria-hidden": "true"
			})
		}) : (reports?.length ?? 0) === 0 ? /* @__PURE__ */ jsx(EmptyState, {
			icon: ShieldCheck,
			title: "Nenhuma denúncia",
			description: "Nada encontrado para este filtro."
		}) : /* @__PURE__ */ jsx("ul", {
			className: "mt-2 space-y-3",
			children: reports.map((report) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, {
				to: "/admin/denuncia/$id",
				params: { id: report.id },
				className: "surface-card block p-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-sm font-bold",
							children: report.protocol
						}), /* @__PURE__ */ jsx("span", {
							className: `rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS[report.status].className}`,
							children: STATUS[report.status].label
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm font-semibold",
						children: categoryLabel(report.category)
					}),
					/* @__PURE__ */ jsx("p", {
						className: "truncate text-xs text-muted-foreground",
						children: report.location_text
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-[11px] text-muted-foreground",
						children: formatDate(report.created_at)
					})
				]
			}) }, report.id))
		})]
	});
}
//#endregion
export { AdminPage as component };
