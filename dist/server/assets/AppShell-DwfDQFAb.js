import { s as useUnreadCount } from "./router-BaP0cReg.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { Link, useRouterState } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Bell, Camera, Home, MapPinned, Trophy, User } from "lucide-react";
//#region src/components/AppShell.tsx
var NAV = [
	{
		to: "/app",
		label: "Início",
		icon: Home,
		highlight: false
	},
	{
		to: "/mapa",
		label: "Mapa",
		icon: MapPinned,
		highlight: false
	},
	{
		to: "/denunciar",
		label: "Denunciar",
		icon: Camera,
		highlight: true
	},
	{
		to: "/conquistas",
		label: "Conquistas",
		icon: Trophy,
		highlight: false
	},
	{
		to: "/perfil",
		label: "Perfil",
		icon: User,
		highlight: false
	}
];
function AppShell({ children, title, subtitle, action, fullBleed = false }) {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const { data: unread = 0 } = useUnreadCount();
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto flex min-h-screen w-full max-w-md flex-col bg-background",
		children: [
			title ? /* @__PURE__ */ jsx("header", {
				className: "sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
						className: "text-lg font-bold",
						children: title
					}), subtitle ? /* @__PURE__ */ jsx("p", {
						className: "text-xs text-muted-foreground",
						children: subtitle
					}) : null] }), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [action, /* @__PURE__ */ jsxs(Link, {
							to: "/notificacoes",
							"aria-label": `Notificações${unread > 0 ? `, ${unread} não lidas` : ""}`,
							className: "relative flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground",
							children: [/* @__PURE__ */ jsx(Bell, {
								className: "h-5 w-5",
								"aria-hidden": "true"
							}), unread > 0 ? /* @__PURE__ */ jsx("span", {
								className: "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground",
								children: unread > 9 ? "9+" : unread
							}) : null]
						})]
					})]
				})
			}) : null,
			/* @__PURE__ */ jsx("main", {
				className: cn("flex-1 pb-32", fullBleed ? "" : "px-4 py-4"),
				children
			}),
			/* @__PURE__ */ jsx("nav", {
				"aria-label": "Navegação principal",
				className: "fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur",
				children: /* @__PURE__ */ jsx("ul", {
					className: "flex items-stretch justify-between",
					children: NAV.map((item) => {
						const active = pathname === item.to;
						const Icon = item.icon;
						return /* @__PURE__ */ jsx("li", {
							className: "flex-1",
							children: /* @__PURE__ */ jsxs(Link, {
								to: item.to,
								className: cn("flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition-colors", active ? "text-leaf-deep" : "text-muted-foreground"),
								"aria-current": active ? "page" : void 0,
								children: [/* @__PURE__ */ jsx("span", {
									className: cn("flex h-9 w-9 items-center justify-center rounded-full transition-colors", item.highlight ? "gradient-leaf text-primary-foreground shadow-glow" : active ? "bg-primary/25" : "bg-transparent"),
									children: /* @__PURE__ */ jsx(Icon, {
										className: "h-5 w-5",
										"aria-hidden": "true"
									})
								}), item.label]
							})
						}, item.to);
					})
				})
			})
		]
	});
}
//#endregion
export { AppShell as t };
