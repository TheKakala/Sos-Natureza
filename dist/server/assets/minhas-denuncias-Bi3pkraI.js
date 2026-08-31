import { t as supabase } from "./client-C8NJlSke.js";
import { i as useAuth } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { t as EmptyState } from "./EmptyState-BvU2HfYM.js";
import { t as StorageImage } from "./StorageImage-CN2VpAnu.js";
import { a as categoryLabel, o as formatDate, r as STATUS } from "./sos-CS-s4mgb.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Loader2 } from "lucide-react";
//#region src/routes/_authenticated/minhas-denuncias.tsx?tsr-split=component
var FILTERS = [
	{
		id: "todas",
		label: "Todas"
	},
	{
		id: "em_analise",
		label: "Em análise"
	},
	{
		id: "em_atendimento",
		label: "Em atendimento"
	},
	{
		id: "concluida",
		label: "Concluídas"
	}
];
function MyReportsPage() {
	const { user } = useAuth();
	const [filter, setFilter] = useState("todas");
	const { data: reports, isLoading, isError } = useQuery({
		queryKey: ["my-reports", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { data, error } = await supabase.from("reports").select("id, protocol, category, status, image_url, location_text, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const filtered = (reports ?? []).filter((report) => filter === "todas" || report.status === filter);
	return /* @__PURE__ */ jsxs(AppShell, {
		title: "Histórico",
		subtitle: "Acompanhe cada protocolo",
		children: [/* @__PURE__ */ jsx("div", {
			className: "mb-4 flex gap-2 overflow-x-auto pb-1",
			children: FILTERS.map((item) => /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setFilter(item.id),
				"aria-pressed": filter === item.id,
				className: `shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${filter === item.id ? "border-primary bg-primary/25 text-leaf-deep" : "border-border bg-card"}`,
				children: item.label
			}, item.id))
		}), isLoading ? /* @__PURE__ */ jsx("div", {
			className: "flex justify-center py-10",
			children: /* @__PURE__ */ jsx(Loader2, {
				className: "h-6 w-6 animate-spin text-leaf-deep",
				"aria-hidden": "true"
			})
		}) : isError ? /* @__PURE__ */ jsx("p", {
			role: "alert",
			className: "surface-card p-4 text-sm",
			children: "Não foi possível carregar os dados. Tente novamente."
		}) : filtered.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
			icon: ClipboardList,
			title: "Nenhuma denúncia por aqui",
			description: "Quando você registrar um problema ambiental, ele aparece nesta lista com protocolo e status.",
			action: /* @__PURE__ */ jsx(Button, {
				asChild: true,
				className: "mt-2 rounded-2xl px-6 font-bold",
				children: /* @__PURE__ */ jsx(Link, {
					to: "/denunciar",
					children: "Fazer denúncia"
				})
			})
		}) : /* @__PURE__ */ jsx("ul", {
			className: "space-y-3",
			children: filtered.map((report) => {
				const status = STATUS[report.status];
				return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, {
					to: "/denuncia/$id",
					params: { id: report.id },
					className: "surface-card flex gap-3 overflow-hidden p-3",
					children: [/* @__PURE__ */ jsx(StorageImage, {
						path: report.image_url,
						alt: "Foto da denúncia",
						className: "h-20 w-20 shrink-0 rounded-xl"
					}), /* @__PURE__ */ jsxs("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "truncate font-bold",
								children: categoryLabel(report.category)
							}),
							/* @__PURE__ */ jsx("p", {
								className: "truncate text-xs text-muted-foreground",
								children: report.location_text || "Local não informado"
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-xs font-semibold",
								children: [
									report.protocol,
									" · ",
									formatDate(report.created_at)
								]
							}),
							/* @__PURE__ */ jsx("span", {
								className: `mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${status.className}`,
								children: status.label
							})
						]
					})]
				}) }, report.id);
			})
		})]
	});
}
//#endregion
export { MyReportsPage as component };
