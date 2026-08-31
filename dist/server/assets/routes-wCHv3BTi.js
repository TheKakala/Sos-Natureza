import { i as useAuth } from "./router-BaP0cReg.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { t as useSound } from "./useSound-D-EGIKxq.js";
import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { LogIn, Sprout, Volume2, VolumeX } from "lucide-react";
//#region src/assets/hero-natureza.jpg
var hero_natureza_default = "/assets/hero-natureza-ClvBSNB9.jpg";
//#endregion
//#region src/routes/index.tsx?tsr-split=component
function WelcomeMenu() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const { prefs, update } = useSound();
	useEffect(() => {
		if (!loading && user) navigate({ to: "/app" });
	}, [
		loading,
		user,
		navigate
	]);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-screen flex-col items-center justify-between bg-background px-6 py-10",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 text-center",
			children: [
				/* @__PURE__ */ jsx("img", {
					src: hero_natureza_default,
					alt: "Ilustração de uma muda verde crescendo do solo com o planeta ao fundo",
					width: 1024,
					height: 1024,
					className: "w-56 rounded-full border-4 border-primary/40 shadow-card sm:w-64"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx("h1", {
						className: "text-4xl font-extrabold uppercase tracking-tight text-leaf-deep",
						children: "SOS Natureza"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-base text-muted-foreground",
						children: "Sua atitude ajuda a transformar o lugar onde você vive."
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-2 flex w-full flex-col gap-3",
					children: [/* @__PURE__ */ jsx(Button, {
						asChild: true,
						size: "lg",
						className: "h-14 rounded-2xl text-base font-bold shadow-glow",
						children: /* @__PURE__ */ jsxs(Link, {
							to: "/criar-conta",
							children: [/* @__PURE__ */ jsx(Sprout, {
								className: "h-5 w-5",
								"aria-hidden": "true"
							}), "Criar uma conta"]
						})
					}), /* @__PURE__ */ jsx(Button, {
						asChild: true,
						size: "lg",
						variant: "outline",
						className: "h-14 rounded-2xl border-2 border-leaf-deep/30 bg-card text-base font-bold",
						children: /* @__PURE__ */ jsxs(Link, {
							to: "/entrar",
							children: [/* @__PURE__ */ jsx(LogIn, {
								className: "h-5 w-5",
								"aria-hidden": "true"
							}), "Entrar"]
						})
					})]
				})
			]
		}), /* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: () => update({ ambient: !prefs.ambient }),
			className: "mt-8 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-foreground",
			"aria-pressed": prefs.ambient,
			children: [prefs.ambient ? /* @__PURE__ */ jsx(Volume2, {
				className: "h-4 w-4",
				"aria-hidden": "true"
			}) : /* @__PURE__ */ jsx(VolumeX, {
				className: "h-4 w-4",
				"aria-hidden": "true"
			}), prefs.ambient ? "Som ambiente ligado" : "Som ambiente desligado"]
		})]
	});
}
//#endregion
export { WelcomeMenu as component };
