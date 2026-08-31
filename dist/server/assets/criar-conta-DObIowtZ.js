import { t as supabase } from "./client-C8NJlSke.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { t as Input } from "./input-B8Q2ztVi.js";
import { t as Label } from "./label-DBD1bRRP.js";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";
//#region src/routes/criar-conta.tsx?tsr-split=component
var schema = z.object({
	fullName: z.string().trim().min(3, "Informe seu nome completo").max(120),
	username: z.string().trim().min(3, "O nome de usuário precisa de ao menos 3 caracteres").max(24).regex(/^[a-zA-Z0-9_.]+$/, "Use apenas letras, números, ponto ou _"),
	email: z.string().trim().email("Informe um e-mail válido").max(255),
	password: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
	confirm: z.string()
}).refine((data) => data.password === data.confirm, {
	message: "As senhas não são iguais",
	path: ["confirm"]
});
function SignUpPage() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		fullName: "",
		username: "",
		email: "",
		password: "",
		confirm: ""
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	function set(key, value) {
		setForm((previous) => ({
			...previous,
			[key]: value
		}));
	}
	async function handleSubmit(event) {
		event.preventDefault();
		setError(null);
		const parsed = schema.safeParse(form);
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Verifique os dados informados.");
			return;
		}
		setLoading(true);
		const { data, error: signUpError } = await supabase.auth.signUp({
			email: parsed.data.email,
			password: parsed.data.password,
			options: {
				emailRedirectTo: `${window.location.origin}/app`,
				data: {
					full_name: parsed.data.fullName,
					username: parsed.data.username
				}
			}
		});
		if (signUpError) {
			setLoading(false);
			const code = signUpError.code ?? "";
			if (code === "weak_password" || signUpError.message.includes("weak")) setError("Essa senha é muito comum. Escolha uma senha mais forte (letras, números e símbolos).");
			else if (code === "user_already_exists" || signUpError.message.includes("already")) setError("Já existe uma conta com este e-mail.");
			else if (code === "over_email_send_rate_limit") setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
			else setError(signUpError.message);
			return;
		}
		setLoading(false);
		if (data.session) {
			toast.success("Conta criada com sucesso!");
			navigate({ to: "/app" });
		} else {
			toast.success("Conta criada! Confirme seu e-mail para entrar.");
			navigate({ to: "/entrar" });
		}
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8",
		children: [
			/* @__PURE__ */ jsxs(Link, {
				to: "/",
				className: "mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground",
				children: [/* @__PURE__ */ jsx(ArrowLeft, {
					className: "h-4 w-4",
					"aria-hidden": "true"
				}), " Voltar"]
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "text-2xl font-bold",
				children: "Criar sua conta"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Toda conta nova começa como cidadão (USER)."
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				className: "mt-6 space-y-4",
				noValidate: true,
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "fullName",
							children: "Nome completo"
						}), /* @__PURE__ */ jsx(Input, {
							id: "fullName",
							value: form.fullName,
							onChange: (e) => set("fullName", e.target.value),
							className: "h-12 bg-card",
							required: true
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "username",
							children: "Nome de usuário"
						}), /* @__PURE__ */ jsx(Input, {
							id: "username",
							value: form.username,
							onChange: (e) => set("username", e.target.value),
							className: "h-12 bg-card",
							required: true
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "email",
							children: "E-mail"
						}), /* @__PURE__ */ jsx(Input, {
							id: "email",
							type: "email",
							value: form.email,
							onChange: (e) => set("email", e.target.value),
							className: "h-12 bg-card",
							required: true
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ jsx(Label, {
								htmlFor: "password",
								children: "Senha"
							}),
							/* @__PURE__ */ jsx(Input, {
								id: "password",
								type: "password",
								value: form.password,
								onChange: (e) => set("password", e.target.value),
								className: "h-12 bg-card",
								required: true
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: "Evite senhas óbvias como 123456. Use ao menos 6 caracteres com letras e números."
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "confirm",
							children: "Confirmar senha"
						}), /* @__PURE__ */ jsx(Input, {
							id: "confirm",
							type: "password",
							value: form.confirm,
							onChange: (e) => set("confirm", e.target.value),
							className: "h-12 bg-card",
							required: true
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "rounded-xl bg-surface p-3 text-xs text-muted-foreground",
						children: "Depois de entrar você escolhe um ícone de perfil na tela \"Editar perfil\"."
					}),
					error ? /* @__PURE__ */ jsx("p", {
						role: "alert",
						className: "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm",
						children: error
					}) : null,
					/* @__PURE__ */ jsxs(Button, {
						type: "submit",
						disabled: loading,
						className: "w-full rounded-2xl py-6 text-base font-bold",
						children: [loading ? /* @__PURE__ */ jsx(Loader2, {
							className: "h-4 w-4 animate-spin",
							"aria-hidden": "true"
						}) : null, "Criar conta"]
					})
				]
			}),
			/* @__PURE__ */ jsx(Link, {
				to: "/entrar",
				className: "mt-4 text-center text-sm font-semibold text-leaf-deep underline",
				children: "Já tenho uma conta"
			})
		]
	});
}
//#endregion
export { SignUpPage as component };
