import { t as supabase } from "./client-C8NJlSke.js";
import { i as useAuth } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { t as Progress } from "./progress-DOIEKRJF.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Loader2, Target } from "lucide-react";
//#region src/routes/_authenticated/desafios.tsx?tsr-split=component
function ChallengesPage() {
	const { user } = useAuth();
	const { data, isLoading, isError } = useQuery({
		queryKey: ["challenges", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const [catalog, mine] = await Promise.all([supabase.from("challenges").select("*"), supabase.from("user_challenges").select("challenge_id, progress, completed_at").eq("user_id", user.id)]);
			if (catalog.error) throw catalog.error;
			return {
				catalog: catalog.data ?? [],
				mine: mine.data ?? []
			};
		}
	});
	return /* @__PURE__ */ jsxs(AppShell, {
		title: "Desafios",
		subtitle: "Participe e ganhe recompensas",
		children: [
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
				children: (data?.catalog ?? []).map((challenge) => {
					const progress = (data?.mine.find((item) => item.challenge_id === challenge.id))?.progress ?? 0;
					const percent = Math.min(100, Math.round(progress / challenge.goal * 100));
					return /* @__PURE__ */ jsxs("li", {
						className: "surface-card p-4",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-leaf-deep",
									children: /* @__PURE__ */ jsx(Target, {
										className: "h-5 w-5",
										"aria-hidden": "true"
									})
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ jsx("p", {
										className: "font-bold",
										children: challenge.title
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-muted-foreground",
										children: challenge.description
									})]
								})]
							}),
							/* @__PURE__ */ jsx(Progress, {
								value: percent,
								className: "mt-3 h-2"
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-1 flex justify-between text-xs font-semibold",
								children: [/* @__PURE__ */ jsxs("span", { children: [
									progress,
									"/",
									challenge.goal,
									" concluído"
								] }), /* @__PURE__ */ jsxs("span", { children: [
									"+",
									challenge.reward_points,
									" pontos"
								] })]
							})
						]
					}, challenge.id);
				})
			}),
			/* @__PURE__ */ jsxs(Link, {
				to: "/dicas",
				className: "mt-5 flex items-center gap-3 rounded-2xl border-2 border-leaf-deep/30 bg-card p-4 text-sm font-bold",
				children: [/* @__PURE__ */ jsx(BookOpen, {
					className: "h-5 w-5 text-leaf-deep",
					"aria-hidden": "true"
				}), "Abrir conteúdos educativos e contar seu tempo de leitura"]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-6 rounded-xl bg-surface p-3 text-xs text-muted-foreground",
				children: "Denuncie apenas problemas reais. Denúncias falsas não geram pontos e podem ser marcadas como inválidas."
			})
		]
	});
}
//#endregion
export { ChallengesPage as component };
