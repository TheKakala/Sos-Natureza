import { t as supabase } from "./client-C8NJlSke.js";
import { i as useAuth } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { t as EmptyState } from "./EmptyState-BvU2HfYM.js";
import { s as rankForXp } from "./sos-CS-s4mgb.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Medal } from "lucide-react";
//#region src/routes/_authenticated/ranking.tsx?tsr-split=component
var TABS = [
	{
		id: "geral",
		label: "Geral"
	},
	{
		id: "mensal",
		label: "Mensal"
	},
	{
		id: "semanal",
		label: "Semanal"
	}
];
function since(tab) {
	const now = /* @__PURE__ */ new Date();
	if (tab === "semanal") return (/* @__PURE__ */ new Date(now.getTime() - 6048e5)).toISOString();
	if (tab === "mensal") return (/* @__PURE__ */ new Date(now.getTime() - 2592e6)).toISOString();
	return null;
}
function RankingPage() {
	const { user } = useAuth();
	const [tab, setTab] = useState("geral");
	const { data, isLoading, isError } = useQuery({
		queryKey: ["ranking", tab],
		queryFn: async () => {
			if (tab === "geral") {
				const { data: rows, error } = await supabase.from("leaderboard").select("id, username, points, xp").order("xp", { ascending: false }).limit(50);
				if (error) throw error;
				return (rows ?? []).map((row) => ({
					id: row.id,
					username: row.username,
					points: row.points ?? 0,
					xp: row.xp ?? 0
				}));
			}
			const from = since(tab);
			const { data: rows, error } = await supabase.from("point_transactions").select("user_id, xp").gte("created_at", from);
			if (error) throw error;
			const totals = /* @__PURE__ */ new Map();
			(rows ?? []).forEach((row) => totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + (row.xp ?? 0)));
			const ids = [...totals.keys()];
			if (ids.length === 0) return [];
			const { data: people } = await supabase.from("leaderboard").select("id, username").in("id", ids);
			return ids.map((id) => ({
				id,
				username: people?.find((person) => person.id === id)?.username ?? "usuario",
				points: totals.get(id) ?? 0,
				xp: totals.get(id) ?? 0
			})).sort((a, b) => b.xp - a.xp).slice(0, 50);
		}
	});
	return /* @__PURE__ */ jsxs(AppShell, {
		title: "Ranking",
		subtitle: "Somente nome público, rank e pontos",
		children: [/* @__PURE__ */ jsx("div", {
			className: "mb-4 flex gap-2",
			children: TABS.map((item) => /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setTab(item.id),
				"aria-pressed": tab === item.id,
				className: `flex-1 rounded-full border px-3 py-2 text-xs font-bold ${tab === item.id ? "border-primary bg-primary/25 text-leaf-deep" : "border-border bg-card"}`,
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
		}) : (data?.length ?? 0) === 0 ? /* @__PURE__ */ jsx(EmptyState, {
			icon: Medal,
			title: "Ranking ainda vazio",
			description: "Ainda não existem dados suficientes para gerar esta estatística."
		}) : /* @__PURE__ */ jsx("ol", {
			className: "space-y-2",
			children: data.map((row, index) => {
				const isMe = row.id === user?.id;
				return /* @__PURE__ */ jsxs("li", {
					className: `flex items-center gap-3 rounded-2xl border p-3 ${isMe ? "border-primary bg-primary/15" : "border-border bg-card"}`,
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "w-7 text-center text-lg font-extrabold text-leaf-deep",
							children: index + 1
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ jsxs("p", {
								className: "truncate font-bold",
								children: [
									"@",
									row.username,
									" ",
									isMe ? /* @__PURE__ */ jsx("span", {
										className: "text-xs font-semibold",
										children: "(você)"
									}) : null
								]
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: rankForXp(row.xp).current.name
							})]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "rounded-full bg-surface px-3 py-1 text-sm font-bold",
							children: [row.points, " pts"]
						})
					]
				}, row.id);
			})
		})]
	});
}
//#endregion
export { RankingPage as component };
