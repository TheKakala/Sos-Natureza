import { t as supabase } from "./client-C8NJlSke.js";
import { a as useIsAdmin, i as useAuth, o as useProfile } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { s as rankForXp } from "./sos-CS-s4mgb.js";
import { t as banner_cidade_default } from "./banner-cidade-DZN4DaV-.js";
import { n as UserAvatar } from "./UserAvatar-CyI08uKa.js";
import { t as Progress } from "./progress-DOIEKRJF.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Camera, ClipboardList, MapPinned, Medal, ShieldCheck, ShoppingBag, Target, Trophy } from "lucide-react";
//#region src/routes/_authenticated/app.tsx?tsr-split=component
var SHORTCUTS = [
	{
		to: "/denunciar",
		label: "Fazer denúncia",
		icon: Camera
	},
	{
		to: "/mapa",
		label: "Mapa",
		icon: MapPinned
	},
	{
		to: "/minhas-denuncias",
		label: "Histórico de denúncias",
		icon: ClipboardList
	},
	{
		to: "/conquistas",
		label: "Conquistas",
		icon: Trophy
	},
	{
		to: "/desafios",
		label: "Desafios",
		icon: Target
	},
	{
		to: "/loja",
		label: "Loja Verde",
		icon: ShoppingBag
	},
	{
		to: "/dicas",
		label: "Dicas ambientais",
		icon: BookOpen
	},
	{
		to: "/ranking",
		label: "Ranking",
		icon: Medal
	}
];
function HomePage() {
	const { user } = useAuth();
	const { data: profile } = useProfile();
	const { data: isAdmin } = useIsAdmin();
	const { data: counts } = useQuery({
		queryKey: ["home-counts", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const [total, done] = await Promise.all([supabase.from("reports").select("id", {
				count: "exact",
				head: true
			}).eq("user_id", user.id), supabase.from("reports").select("id", {
				count: "exact",
				head: true
			}).eq("user_id", user.id).eq("status", "concluida")]);
			return {
				total: total.count ?? 0,
				done: done.count ?? 0
			};
		}
	});
	const xp = profile?.xp ?? 0;
	const rank = rankForXp(xp);
	return /* @__PURE__ */ jsxs(AppShell, {
		title: "Início",
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "surface-card flex items-center gap-3 p-4",
				children: [
					/* @__PURE__ */ jsx(UserAvatar, {
						value: profile?.avatar_url,
						className: "h-14 w-14"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsx("p", {
							className: "truncate text-base font-bold",
							children: profile?.full_name || "Cidadão(ã)"
						}), /* @__PURE__ */ jsxs("p", {
							className: "truncate text-xs text-muted-foreground",
							children: ["@", profile?.username ?? "usuario"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-xl bg-primary/20 px-3 py-2 text-center",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-lg font-extrabold leading-none text-leaf-deep",
							children: profile?.points ?? 0
						}), /* @__PURE__ */ jsx("p", {
							className: "text-[10px] font-semibold uppercase text-muted-foreground",
							children: "pontos"
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "gradient-leaf mt-4 rounded-2xl p-4 text-primary-foreground shadow-glow",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-xs font-bold uppercase tracking-wide opacity-80",
						children: "Seu rank"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-1 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-xl font-extrabold",
							children: rank.current.name
						}), /* @__PURE__ */ jsxs("span", {
							className: "rounded-full bg-background/70 px-3 py-1 text-sm font-bold text-leaf-deep",
							children: [xp, " XP"]
						})]
					}),
					/* @__PURE__ */ jsx(Progress, {
						value: rank.progress,
						className: "mt-3 h-2.5 bg-background/50"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 text-xs font-semibold",
						children: rank.next ? `Faltam ${rank.toNext} XP para ${rank.next.name}` : "Você alcançou o rank máximo. Parabéns!"
					})
				]
			}),
			isAdmin ? /* @__PURE__ */ jsxs(Link, {
				to: "/admin",
				className: "mt-4 flex items-center gap-3 rounded-2xl border-2 border-leaf-deep/30 bg-card p-4 font-bold",
				children: [/* @__PURE__ */ jsx(ShieldCheck, {
					className: "h-5 w-5 text-leaf-deep",
					"aria-hidden": "true"
				}), "Painel administrativo da Prefeitura"]
			}) : null,
			/* @__PURE__ */ jsxs("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground",
					children: "Atalhos"
				}), /* @__PURE__ */ jsx("ul", {
					className: "grid grid-cols-2 gap-3",
					children: SHORTCUTS.map((item) => {
						const Icon = item.icon;
						return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, {
							to: item.to,
							className: "surface-card flex h-full flex-col gap-2 p-4 text-sm font-bold",
							children: [/* @__PURE__ */ jsx("span", {
								className: "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-leaf-deep",
								children: /* @__PURE__ */ jsx(Icon, {
									className: "h-5 w-5",
									"aria-hidden": "true"
								})
							}), item.label]
						}) }, item.to);
					})
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-5 grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "surface-card p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-2xl font-extrabold text-leaf-deep",
						children: counts?.total ?? 0
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs font-semibold text-muted-foreground",
						children: "Denúncias enviadas"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "surface-card p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-2xl font-extrabold text-leaf-deep",
						children: counts?.done ?? 0
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs font-semibold text-muted-foreground",
						children: "Problemas resolvidos"
					})]
				})]
			}),
			/* @__PURE__ */ jsx("img", {
				src: banner_cidade_default,
				alt: "Ilustração de uma cidade sustentável com árvores, rio limpo e pessoas cuidando do ambiente",
				width: 1280,
				height: 640,
				loading: "lazy",
				className: "mt-5 w-full rounded-2xl border border-border object-cover"
			})
		]
	});
}
//#endregion
export { HomePage as component };
