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
//#region src/routes/entrar.tsx?tsr-split=component
var schema = z.object({
	email: z.string().trim().email("Informe um e-mail válido").max(255),
	password: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72)
});
function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [needsConfirm, setNeedsConfirm] = useState(false);
	async function handleResendConfirmation() {
		const parsed = z.string().email().safeParse(email.trim());
		if (!parsed.success) {
			setError("Digite seu e-mail para reenviarmos a confirmação.");
			return;
		}
		const { error: resendError } = await supabase.auth.resend({
			type: "signup",
			email: parsed.data,
			options: { emailRedirectTo: `${window.location.origin}/entrar` }
		});
		if (resendError) toast.error("Não foi possível reenviar agora. Tente em alguns minutos.");
		else toast.success("Reenviamos o e-mail de confirmação!");
	}
	async function handleSubmit(event) {
		event.preventDefault();
		setError(null);
		const parsed = schema.safeParse({
			email,
			password
		});
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Verifique os dados informados.");
			return;
		}
		setLoading(true);
		const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
		setLoading(false);
		if (signInError) {
			if ((signInError.code ?? "") === "email_not_confirmed" || signInError.message.includes("not confirmed")) {
				setNeedsConfirm(true);
				setError("Seu e-mail ainda não foi confirmado. Abra o link que enviamos para sua caixa de entrada (veja também o spam).");
			} else setError("E-mail ou senha incorretos.");
			return;
		}
		toast.success("Bem-vindo de volta!");
		navigate({ to: "/app" });
	}
	async function handleReset() {
		const parsed = z.string().email().safeParse(email.trim());
		if (!parsed.success) {
			setError("Digite seu e-mail para receber o link de recuperação.");
			return;
		}
		const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: `${window.location.origin}/redefinir-senha` });
		if (resetError) toast.error("Não foi possível enviar o e-mail agora.");
		else toast.success("Enviamos um link de recuperação para seu e-mail.");
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
				children: "Entrar na sua conta"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Use o mesmo acesso para cidadãos e para a prefeitura."
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				className: "mt-6 space-y-4",
				noValidate: true,
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "email",
							children: "E-mail"
						}), /* @__PURE__ */ jsx(Input, {
							id: "email",
							type: "email",
							autoComplete: "email",
							value: email,
							onChange: (event) => setEmail(event.target.value),
							className: "h-12 bg-card",
							required: true
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "password",
							children: "Senha"
						}), /* @__PURE__ */ jsx(Input, {
							id: "password",
							type: "password",
							autoComplete: "current-password",
							value: password,
							onChange: (event) => setPassword(event.target.value),
							className: "h-12 bg-card",
							required: true
						})]
					}),
					error ? /* @__PURE__ */ jsx("p", {
						role: "alert",
						className: "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm",
						children: error
					}) : null,
					needsConfirm ? /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: handleResendConfirmation,
						className: "w-full text-sm font-semibold text-leaf-deep underline",
						children: "Reenviar e-mail de confirmação"
					}) : null,
					/* @__PURE__ */ jsxs(Button, {
						type: "submit",
						disabled: loading,
						className: "h-13 w-full rounded-2xl py-3 text-base font-bold",
						children: [loading ? /* @__PURE__ */ jsx(Loader2, {
							className: "h-4 w-4 animate-spin",
							"aria-hidden": "true"
						}) : null, "Entrar"]
					})
				]
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: handleReset,
				className: "mt-4 text-sm font-semibold text-leaf-deep underline",
				children: "Esqueci minha senha"
			}),
			/* @__PURE__ */ jsx(Link, {
				to: "/criar-conta",
				className: "mt-2 text-sm font-semibold text-leaf-deep underline",
				children: "Criar uma conta"
			})
		]
	});
}
//#endregion
export { LoginPage as component };
