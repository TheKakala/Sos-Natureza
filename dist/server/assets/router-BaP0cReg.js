import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.js";
import { t as supabase } from "./client-C8NJlSke.js";
import { createContext, useContext, useEffect, useState } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, redirect, useRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
//#region src/styles.css?url
var styles_default = "/assets/styles-5OqJUhLf.css";
//#endregion
//#region src/lib/lovable-error-reporting.ts
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
//#endregion
//#region src/hooks/useAuth.tsx
var AuthContext = createContext({
	session: null,
	user: null,
	loading: true
});
function AuthProvider({ children }) {
	const [state, setState] = useState({
		session: null,
		user: null,
		loading: true
	});
	const queryClient = useQueryClient();
	useEffect(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
			setState({
				session,
				user: session?.user ?? null,
				loading: false
			});
			if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") queryClient.invalidateQueries();
		});
		supabase.auth.getSession().then(({ data }) => {
			setState({
				session: data.session,
				user: data.session?.user ?? null,
				loading: false
			});
		});
		return () => sub.subscription.unsubscribe();
	}, [queryClient]);
	return /* @__PURE__ */ jsx(AuthContext.Provider, {
		value: state,
		children
	});
}
function useAuth() {
	return useContext(AuthContext);
}
function useProfile() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["profile", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("id, full_name, username, avatar_url, points, xp, created_at").eq("id", user.id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
}
function useIsAdmin() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["is-admin", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "ADMIN").maybeSingle();
			if (error) throw error;
			return Boolean(data);
		}
	});
}
function useUnreadCount() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["notifications-unread", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { count, error } = await supabase.from("notifications").select("id", {
				count: "exact",
				head: true
			}).eq("user_id", user.id).eq("read", false);
			if (error) throw error;
			return count ?? 0;
		}
	});
}
//#endregion
//#region src/components/ui/sonner.tsx
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ jsx(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
//#endregion
//#region src/routes/__root.tsx
function NotFoundComponent() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	useEffect(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ jsx("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$20 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "SOS Natureza — Denúncias ambientais da sua cidade" },
			{
				name: "description",
				content: "Registre problemas ambientais, acompanhe o atendimento da Prefeitura e ganhe pontos."
			},
			{
				property: "og:title",
				content: "SOS Natureza"
			},
			{
				property: "og:description",
				content: "Denuncie problemas ambientais e acompanhe a solução."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.ico",
			type: "image/x-icon"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [children, /* @__PURE__ */ jsx(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$20.useRouteContext();
	return /* @__PURE__ */ jsx(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ jsxs(AuthProvider, { children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(Toaster$1, {
			position: "top-center",
			richColors: true
		})] })
	});
}
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter$19 = () => import("./routes-wCHv3BTi.js");
var Route$19 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "SOS Natureza — Denuncie problemas ambientais da sua cidade" },
		{
			name: "description",
			content: "Registre denúncias ambientais com foto e local, acompanhe o atendimento da prefeitura e ganhe pontos, conquistas e ranks."
		},
		{
			property: "og:title",
			content: "SOS Natureza — Sua atitude transforma o lugar onde você vive"
		},
		{
			property: "og:description",
			content: "Plataforma ambiental que conecta cidadãos e prefeitura para resolver problemas ambientais."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
//#endregion
//#region src/routes/_authenticated/route.tsx
var $$splitComponentImporter$18 = () => import("./route-Di7iQBCH.js");
var Route$18 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data: sessionData } = await supabase.auth.getSession();
		if (sessionData.session?.user) return { user: sessionData.session.user };
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/entrar" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
//#endregion
//#region src/routes/criar-conta.tsx
var $$splitComponentImporter$17 = () => import("./criar-conta-DObIowtZ.js");
var Route$17 = createFileRoute("/criar-conta")({
	head: () => ({ meta: [
		{ title: "Criar sua conta — SOS Natureza" },
		{
			name: "description",
			content: "Crie sua conta gratuita no SOS Natureza para denunciar problemas ambientais na sua cidade."
		},
		{
			property: "og:title",
			content: "Criar sua conta — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Crie sua conta e comece a cuidar da sua cidade."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
//#endregion
//#region src/routes/entrar.tsx
var $$splitComponentImporter$16 = () => import("./entrar-Bqya91aN.js");
var Route$16 = createFileRoute("/entrar")({
	head: () => ({ meta: [
		{ title: "Entrar — SOS Natureza" },
		{
			name: "description",
			content: "Acesse sua conta do SOS Natureza e acompanhe suas denúncias ambientais."
		},
		{
			property: "og:title",
			content: "Entrar — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Acesse sua conta e acompanhe suas denúncias ambientais."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
//#endregion
//#region src/routes/redefinir-senha.tsx
var $$splitComponentImporter$15 = () => import("./redefinir-senha-WWvMK84f.js");
var Route$15 = createFileRoute("/redefinir-senha")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Redefinir senha — SOS Natureza" },
		{
			name: "description",
			content: "Crie uma nova senha para voltar a acessar sua conta no SOS Natureza."
		},
		{
			property: "og:title",
			content: "Redefinir senha — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Crie uma nova senha e volte a cuidar da sua cidade."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
//#endregion
//#region src/routes/_authenticated/admin.tsx
var $$splitComponentImporter$14 = () => import("./admin-CTBd8fR6.js");
var Route$14 = createFileRoute("/_authenticated/admin")({
	head: () => ({ meta: [
		{ title: "Painel da Prefeitura — SOS Natureza" },
		{
			name: "description",
			content: "Gestão das denúncias ambientais recebidas pela Prefeitura."
		},
		{
			property: "og:title",
			content: "Painel da Prefeitura — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Acompanhe e atualize as denúncias ambientais."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
//#endregion
//#region src/routes/_authenticated/app.tsx
var $$splitComponentImporter$13 = () => import("./app-D-mAyJT8.js");
var Route$13 = createFileRoute("/_authenticated/app")({
	head: () => ({ meta: [
		{ title: "Início — SOS Natureza" },
		{
			name: "description",
			content: "Seu painel: rank, pontos, denúncias e atalhos do SOS Natureza."
		},
		{
			property: "og:title",
			content: "Início — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Acompanhe seu rank, pontos e denúncias ambientais."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
//#endregion
//#region src/routes/_authenticated/conquistas.tsx
var $$splitComponentImporter$12 = () => import("./conquistas-Bl-MzjXC.js");
var Route$12 = createFileRoute("/_authenticated/conquistas")({
	head: () => ({ meta: [
		{ title: "Conquistas — SOS Natureza" },
		{
			name: "description",
			content: "Veja suas 30 conquistas ambientais, requisitos e recompensas."
		},
		{
			property: "og:title",
			content: "Conquistas — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Desbloqueie conquistas cuidando da sua cidade."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
//#endregion
//#region src/routes/_authenticated/denunciar.tsx
var $$splitComponentImporter$11 = () => import("./denunciar-ByjdbpQa.js");
var Route$11 = createFileRoute("/_authenticated/denunciar")({
	head: () => ({ meta: [
		{ title: "Fazer denúncia — SOS Natureza" },
		{
			name: "description",
			content: "Registre um problema ambiental com tipo, local, foto e descrição."
		},
		{
			property: "og:title",
			content: "Fazer denúncia — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Registre um problema ambiental em poucos passos."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
//#endregion
//#region src/routes/_authenticated/desafios.tsx
var $$splitComponentImporter$10 = () => import("./desafios-DBlWEWYA.js");
var Route$10 = createFileRoute("/_authenticated/desafios")({
	head: () => ({ meta: [
		{ title: "Desafios — SOS Natureza" },
		{
			name: "description",
			content: "Participe dos desafios ambientais e ganhe pontos extras."
		},
		{
			property: "og:title",
			content: "Desafios — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Complete desafios ambientais e ganhe recompensas."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
//#endregion
//#region src/routes/_authenticated/dicas.tsx
var $$splitComponentImporter$9 = () => import("./dicas-ygFNLWyl.js");
var Route$9 = createFileRoute("/_authenticated/dicas")({
	head: () => ({ meta: [
		{ title: "Dicas ambientais — SOS Natureza" },
		{
			name: "description",
			content: "Conteúdos educativos sobre água, florestas, reciclagem, queimadas e lixo."
		},
		{
			property: "og:title",
			content: "Dicas ambientais — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Aprenda atitudes simples que ajudam o meio ambiente."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
/** Segundos de leitura necessários para o conteúdo contar como lido. */
//#endregion
//#region src/routes/_authenticated/editar-perfil.tsx
var $$splitComponentImporter$8 = () => import("./editar-perfil-zLi52fvo.js");
var Route$8 = createFileRoute("/_authenticated/editar-perfil")({
	head: () => ({ meta: [
		{ title: "Editar perfil — SOS Natureza" },
		{
			name: "description",
			content: "Altere seu nome, nome de usuário e escolha um ícone de perfil."
		},
		{
			property: "og:title",
			content: "Editar perfil — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Personalize seu perfil com ícones da natureza."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
//#endregion
//#region src/routes/_authenticated/loja.tsx
var $$splitComponentImporter$7 = () => import("./loja-BZVJUPx9.js");
var Route$7 = createFileRoute("/_authenticated/loja")({
	head: () => ({ meta: [
		{ title: "Loja Verde — SOS Natureza" },
		{
			name: "description",
			content: "Troque seus pontos por avatares, molduras e itens exclusivos."
		},
		{
			property: "og:title",
			content: "Loja Verde — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Use seus pontos em itens exclusivos da Loja Verde."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
//#endregion
//#region src/routes/_authenticated/mapa.tsx
var $$splitComponentImporter$6 = () => import("./mapa-7O9j05C7.js");
var Route$6 = createFileRoute("/_authenticated/mapa")({
	head: () => ({ meta: [
		{ title: "Mapa das denúncias — SOS Natureza" },
		{
			name: "description",
			content: "Mapa interativo com as denúncias ambientais registradas."
		},
		{
			property: "og:title",
			content: "Mapa das denúncias — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Navegue pelo mapa e veja os problemas ambientais registrados."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
//#endregion
//#region src/routes/_authenticated/minhas-denuncias.tsx
var $$splitComponentImporter$5 = () => import("./minhas-denuncias-Bi3pkraI.js");
var Route$5 = createFileRoute("/_authenticated/minhas-denuncias")({
	head: () => ({ meta: [
		{ title: "Minhas denúncias — SOS Natureza" },
		{
			name: "description",
			content: "Acompanhe o status e o protocolo das denúncias que você registrou."
		},
		{
			property: "og:title",
			content: "Minhas denúncias — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Acompanhe suas denúncias ambientais."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
//#endregion
//#region src/routes/_authenticated/notificacoes.tsx
var $$splitComponentImporter$4 = () => import("./notificacoes-Cm4YuLLV.js");
var Route$4 = createFileRoute("/_authenticated/notificacoes")({
	head: () => ({ meta: [
		{ title: "Notificações — SOS Natureza" },
		{
			name: "description",
			content: "Acompanhe atualizações das suas denúncias, conquistas e pontos."
		},
		{
			property: "og:title",
			content: "Notificações — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Atualizações de denúncias, conquistas e pontos."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
//#endregion
//#region src/routes/_authenticated/perfil.tsx
var $$splitComponentImporter$3 = () => import("./perfil-39AkYPj6.js");
var Route$3 = createFileRoute("/_authenticated/perfil")({
	head: () => ({ meta: [
		{ title: "Perfil — SOS Natureza" },
		{
			name: "description",
			content: "Seus dados, rank, itens adquiridos e configurações da conta."
		},
		{
			property: "og:title",
			content: "Perfil — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Veja seu rank, itens e configurações."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
//#endregion
//#region src/routes/_authenticated/ranking.tsx
var $$splitComponentImporter$2 = () => import("./ranking-C1wi3gfg.js");
var Route$2 = createFileRoute("/_authenticated/ranking")({
	head: () => ({ meta: [
		{ title: "Ranking — SOS Natureza" },
		{
			name: "description",
			content: "Ranking geral, semanal e mensal dos cidadãos mais atuantes."
		},
		{
			property: "og:title",
			content: "Ranking — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Veja os cidadãos que mais cuidam da cidade."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
//#endregion
//#region src/routes/_authenticated/denuncia.$id.tsx
var $$splitNotFoundComponentImporter$1 = () => import("./denuncia._id-CwSbQTa4.js");
var $$splitErrorComponentImporter$1 = () => import("./denuncia._id-XOqfrLzv.js");
var $$splitComponentImporter$1 = () => import("./denuncia._id-UayPDzgi.js");
var Route$1 = createFileRoute("/_authenticated/denuncia/$id")({
	head: () => ({ meta: [
		{ title: "Detalhes da denúncia — SOS Natureza" },
		{
			name: "description",
			content: "Veja o andamento, o local e a solução da sua denúncia ambiental."
		},
		{
			property: "og:title",
			content: "Detalhes da denúncia — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Acompanhe o andamento da denúncia."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent")
});
//#endregion
//#region src/routes/_authenticated/admin.denuncia.$id.tsx
var $$splitNotFoundComponentImporter = () => import("./admin.denuncia._id-CtEjrh5C.js");
var $$splitErrorComponentImporter = () => import("./admin.denuncia._id-DFCgJ6NR.js");
var $$splitComponentImporter = () => import("./admin.denuncia._id-HNF-dFh9.js");
var Route = createFileRoute("/_authenticated/admin/denuncia/$id")({
	head: () => ({ meta: [
		{ title: "Atualizar denúncia — SOS Natureza" },
		{
			name: "description",
			content: "Atualize o status, envie a foto da solução e registre observações."
		},
		{
			property: "og:title",
			content: "Atualizar denúncia — SOS Natureza"
		},
		{
			property: "og:description",
			content: "Gestão da denúncia ambiental pela Prefeitura."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
//#region src/routeTree.gen.ts
var IndexRoute = Route$19.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$20
});
var AuthenticatedRouteRoute = Route$18.update({
	id: "/_authenticated",
	getParentRoute: () => Route$20
});
var CriarContaRoute = Route$17.update({
	id: "/criar-conta",
	path: "/criar-conta",
	getParentRoute: () => Route$20
});
var EntrarRoute = Route$16.update({
	id: "/entrar",
	path: "/entrar",
	getParentRoute: () => Route$20
});
var RedefinirSenhaRoute = Route$15.update({
	id: "/redefinir-senha",
	path: "/redefinir-senha",
	getParentRoute: () => Route$20
});
var AuthenticatedAdminRoute = Route$14.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAppRoute = Route$13.update({
	id: "/app",
	path: "/app",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedConquistasRoute = Route$12.update({
	id: "/conquistas",
	path: "/conquistas",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDenunciarRoute = Route$11.update({
	id: "/denunciar",
	path: "/denunciar",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDesafiosRoute = Route$10.update({
	id: "/desafios",
	path: "/desafios",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDicasRoute = Route$9.update({
	id: "/dicas",
	path: "/dicas",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedEditarPerfilRoute = Route$8.update({
	id: "/editar-perfil",
	path: "/editar-perfil",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedLojaRoute = Route$7.update({
	id: "/loja",
	path: "/loja",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedMapaRoute = Route$6.update({
	id: "/mapa",
	path: "/mapa",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedMinhasDenunciasRoute = Route$5.update({
	id: "/minhas-denuncias",
	path: "/minhas-denuncias",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedNotificacoesRoute = Route$4.update({
	id: "/notificacoes",
	path: "/notificacoes",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPerfilRoute = Route$3.update({
	id: "/perfil",
	path: "/perfil",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRankingRoute = Route$2.update({
	id: "/ranking",
	path: "/ranking",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDenunciaIdRoute = Route$1.update({
	id: "/denuncia/$id",
	path: "/denuncia/$id",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminRouteChildren = { AuthenticatedAdminDenunciaIdRoute: Route.update({
	id: "/denuncia/$id",
	path: "/denuncia/$id",
	getParentRoute: () => AuthenticatedAdminRoute
}) };
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAdminRoute: AuthenticatedAdminRoute._addFileChildren(AuthenticatedAdminRouteChildren),
	AuthenticatedAppRoute,
	AuthenticatedConquistasRoute,
	AuthenticatedDenunciarRoute,
	AuthenticatedDesafiosRoute,
	AuthenticatedDicasRoute,
	AuthenticatedEditarPerfilRoute,
	AuthenticatedLojaRoute,
	AuthenticatedMapaRoute,
	AuthenticatedMinhasDenunciasRoute,
	AuthenticatedNotificacoesRoute,
	AuthenticatedPerfilRoute,
	AuthenticatedRankingRoute,
	AuthenticatedDenunciaIdRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	CriarContaRoute,
	EntrarRoute,
	RedefinirSenhaRoute
};
var routeTree = Route$20._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { useIsAdmin as a, getRouter, useAuth as i, Route as n, useProfile as o, Route$1 as r, useUnreadCount as s, router_exports as t };
