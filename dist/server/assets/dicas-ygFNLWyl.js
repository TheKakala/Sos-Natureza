import { t as supabase } from "./client-C8NJlSke.js";
import { i as useAuth } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { t as banner_cidade_default } from "./banner-cidade-DZN4DaV-.js";
import { useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen, CheckCircle2, ChevronDown, Clock, Loader2 } from "lucide-react";
//#region src/routes/_authenticated/dicas.tsx?tsr-split=component
var CATEGORIES = [
	{
		id: "todas",
		label: "Todas"
	},
	{
		id: "agua",
		label: "Água"
	},
	{
		id: "florestas",
		label: "Florestas"
	},
	{
		id: "reciclagem",
		label: "Reciclagem"
	},
	{
		id: "queimadas",
		label: "Queimadas"
	},
	{
		id: "lixo",
		label: "Lixo"
	},
	{
		id: "sustentabilidade",
		label: "Sustentabilidade"
	}
];
/** Segundos de leitura necessários para o conteúdo contar como lido. */
var READ_SECONDS = 15;
function TipsPage() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [category, setCategory] = useState("todas");
	const [openId, setOpenId] = useState(null);
	const [seconds, setSeconds] = useState(0);
	const savingRef = useRef(null);
	const { data, isLoading, isError } = useQuery({
		queryKey: ["tips"],
		queryFn: async () => {
			const { data: rows, error } = await supabase.from("tips").select("*");
			if (error) throw error;
			return rows ?? [];
		}
	});
	const { data: readIds } = useQuery({
		queryKey: ["tip-reads", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { data: rows, error } = await supabase.from("tip_reads").select("tip_id").eq("user_id", user.id);
			if (error) throw error;
			return new Set((rows ?? []).map((row) => row.tip_id));
		}
	});
	useEffect(() => {
		if (!openId) return;
		setSeconds(0);
		const interval = window.setInterval(() => setSeconds((value) => value + 1), 1e3);
		return () => window.clearInterval(interval);
	}, [openId]);
	useEffect(() => {
		if (!openId || !user || seconds < READ_SECONDS) return;
		if (readIds?.has(openId) || savingRef.current === openId) return;
		savingRef.current = openId;
		const tipId = openId;
		supabase.from("tip_reads").insert({
			user_id: user.id,
			tip_id: tipId,
			seconds
		}).then(({ error }) => {
			if (error) {
				savingRef.current = null;
				return;
			}
			toast.success("Leitura concluída! Progresso registrado.");
			queryClient.invalidateQueries({ queryKey: ["tip-reads", user.id] });
			queryClient.invalidateQueries({ queryKey: ["challenges", user.id] });
			queryClient.invalidateQueries({ queryKey: ["achievements", user.id] });
			queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
		});
	}, [
		openId,
		seconds,
		user,
		readIds,
		queryClient
	]);
	const filtered = (data ?? []).filter((tip) => category === "todas" || tip.category === category);
	const readCount = readIds?.size ?? 0;
	return /* @__PURE__ */ jsxs(AppShell, {
		title: "Dicas ambientais",
		subtitle: `${readCount} conteúdos lidos`,
		children: [
			/* @__PURE__ */ jsx("img", {
				src: banner_cidade_default,
				alt: "Ilustração de uma cidade sustentável com árvores e rio limpo",
				width: 1280,
				height: 640,
				loading: "lazy",
				className: "mb-4 w-full rounded-2xl border border-border object-cover"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mb-4 flex gap-2 overflow-x-auto pb-1",
				children: CATEGORIES.map((item) => /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setCategory(item.id),
					"aria-pressed": category === item.id,
					className: `shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${category === item.id ? "border-primary bg-primary/25 text-leaf-deep" : "border-border bg-card"}`,
					children: item.label
				}, item.id))
			}),
			isLoading ? /* @__PURE__ */ jsx("div", {
				className: "flex justify-center py-10",
				children: /* @__PURE__ */ jsx(Loader2, {
					className: "h-6 w-6 animate-spin text-leaf-deep",
					"aria-hidden": "true"
				})
			}) : isError ? /* @__PURE__ */ jsx("p", {
				role: "alert",
				className: "surface-card p-4 text-sm",
				children: "Não foi possível carregar os dados. Tente novamente."
			}) : /* @__PURE__ */ jsx("ul", {
				className: "space-y-3",
				children: filtered.map((tip) => {
					const open = openId === tip.id;
					const alreadyRead = readIds?.has(tip.id) ?? false;
					const left = Math.max(0, READ_SECONDS - seconds);
					return /* @__PURE__ */ jsxs("li", {
						className: "surface-card overflow-hidden",
						children: [/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setOpenId(open ? null : tip.id),
							"aria-expanded": open,
							className: "flex w-full items-center gap-2 p-4 text-left",
							children: [
								/* @__PURE__ */ jsx(BookOpen, {
									className: "h-4 w-4 shrink-0 text-leaf-deep",
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "flex-1 font-bold",
									children: tip.title
								}),
								alreadyRead ? /* @__PURE__ */ jsx(CheckCircle2, {
									className: "h-4 w-4 text-success",
									"aria-label": "Conteúdo já lido"
								}) : null,
								/* @__PURE__ */ jsx(ChevronDown, {
									className: `h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`,
									"aria-hidden": "true"
								})
							]
						}), open ? /* @__PURE__ */ jsxs("div", {
							className: "space-y-3 px-4 pb-4",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-sm text-muted-foreground",
									children: tip.body
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "rounded-xl bg-primary/15 p-3 text-sm font-semibold",
									children: ["Dica prática: ", tip.practical_tip]
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground",
									children: [/* @__PURE__ */ jsx(Clock, {
										className: "h-3.5 w-3.5",
										"aria-hidden": "true"
									}), alreadyRead ? `Você leu este conteúdo. Tempo nesta leitura: ${seconds}s` : left > 0 ? `Tempo de leitura: ${seconds}s — faltam ${left}s para concluir` : "Leitura concluída!"]
								})
							]
						}) : null]
					}, tip.id);
				})
			})
		]
	});
}
//#endregion
export { TipsPage as component };
