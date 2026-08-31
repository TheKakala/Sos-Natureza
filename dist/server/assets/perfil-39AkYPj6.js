import { t as supabase } from "./client-C8NJlSke.js";
import { i as useAuth, o as useProfile } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { o as formatDate, s as rankForXp } from "./sos-CS-s4mgb.js";
import { n as UserAvatar } from "./UserAvatar-CyI08uKa.js";
import { t as Progress } from "./progress-DOIEKRJF.js";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Pencil } from "lucide-react";
//#region src/routes/_authenticated/perfil.tsx?tsr-split=component
function PerfilPage() {
	const { user } = useAuth();
	const { data: profile } = useProfile();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: items } = useQuery({
		queryKey: ["inventory-items", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { data, error } = await supabase.from("inventory").select("id, item_id, shop_items(name, icon)").eq("user_id", user.id);
			if (error) throw error;
			return data ?? [];
		}
	});
	const xp = profile?.xp ?? 0;
	const rank = rankForXp(xp);
	return /* @__PURE__ */ jsxs(AppShell, {
		title: "Perfil",
		subtitle: "Sua conta no SOS Natureza",
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "surface-card flex items-center gap-3 p-4",
				children: [/* @__PURE__ */ jsx(UserAvatar, {
					value: profile?.avatar_url,
					className: "h-16 w-16"
				}), /* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "truncate text-base font-bold",
							children: profile?.full_name || "Cidadão(ã)"
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "truncate text-xs text-muted-foreground",
							children: ["@", profile?.username ?? "usuario"]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "truncate text-xs text-muted-foreground",
							children: ["Membro desde ", formatDate(profile?.created_at)]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "gradient-leaf mt-4 rounded-2xl p-4 text-primary-foreground shadow-glow",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-xs font-bold uppercase tracking-wide opacity-80",
						children: "Rank atual"
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
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-5 grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "surface-card p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-2xl font-extrabold text-leaf-deep",
						children: profile?.points ?? 0
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs font-semibold text-muted-foreground",
						children: "Pontos"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "surface-card p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-2xl font-extrabold text-leaf-deep",
						children: items?.length ?? 0
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs font-semibold text-muted-foreground",
						children: "Itens adquiridos"
					})]
				})]
			}),
			items && items.length > 0 ? /* @__PURE__ */ jsxs("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground",
					children: "Meus itens"
				}), /* @__PURE__ */ jsx("ul", {
					className: "flex flex-wrap gap-2",
					children: items.map((row) => /* @__PURE__ */ jsxs("li", {
						className: "surface-card flex items-center gap-2 px-3 py-2 text-sm font-semibold",
						children: [/* @__PURE__ */ jsx("span", {
							"aria-hidden": "true",
							children: row.shop_items?.icon
						}), row.shop_items?.name ?? row.item_id]
					}, row.id))
				})]
			}) : null,
			/* @__PURE__ */ jsxs(Link, {
				to: "/editar-perfil",
				className: "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-leaf-deep/30 bg-card px-4 py-3 text-sm font-bold",
				children: [/* @__PURE__ */ jsx(Pencil, {
					className: "h-4 w-4",
					"aria-hidden": "true"
				}), "Editar perfil"]
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: async () => {
					await queryClient.cancelQueries();
					queryClient.clear();
					await supabase.auth.signOut();
					navigate({ to: "/" });
				},
				className: "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-bold text-foreground",
				children: [/* @__PURE__ */ jsx(LogOut, {
					className: "h-4 w-4",
					"aria-hidden": "true"
				}), "Sair da conta"]
			})
		]
	});
}
//#endregion
export { PerfilPage as component };
