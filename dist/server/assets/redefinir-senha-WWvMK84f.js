import { t as supabase } from "./client-C8NJlSke.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { t as Input } from "./input-B8Q2ztVi.js";
import { t as Label } from "./label-DBD1bRRP.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";
//#region src/routes/redefinir-senha.tsx?tsr-split=component
function ResetPasswordPage() {
	const navigate = useNavigate();
	const [ready, setReady] = useState(false);
	const [valid, setValid] = useState(false);
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	useEffect(() => {
		let active = true;
		async function prepare() {
			const url = new URL(window.location.href);
			const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
			const code = url.searchParams.get("code");
			const tokenHash = url.searchParams.get("token_hash");
			try {
				if (code) await supabase.auth.exchangeCodeForSession(code);
				else if (tokenHash) await supabase.auth.verifyOtp({
					type: "recovery",
					token_hash: tokenHash
				});
				else if (hashParams.get("access_token") && hashParams.get("refresh_token")) await supabase.auth.setSession({
					access_token: hashParams.get("access_token"),
					refresh_token: hashParams.get("refresh_token")
				});
			} catch {}
			const { data } = await supabase.auth.getSession();
			if (!active) return;
			setValid(Boolean(data.session));
			setReady(true);
			window.history.replaceState({}, "", "/redefinir-senha");
		}
		prepare();
		return () => {
			active = false;
		};
	}, []);
	async function handleSubmit(event) {
		event.preventDefault();
		setError(null);
		const parsed = z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72).safeParse(password);
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Senha inválida.");
			return;
		}
		if (password !== confirm) {
			setError("As senhas não são iguais.");
			return;
		}
		setLoading(true);
		const { error: updateError } = await supabase.auth.updateUser({ password });
		setLoading(false);
		if (updateError) {
			const code = updateError.code ?? "";
			if (code === "weak_password" || updateError.message.includes("weak")) setError("Essa senha é muito comum. Escolha uma senha mais forte.");
			else if (code === "same_password") setError("A nova senha precisa ser diferente da anterior.");
			else setError(updateError.message);
			return;
		}
		toast.success("Senha alterada com sucesso!");
		navigate({ to: "/app" });
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8",
		children: [
			/* @__PURE__ */ jsxs(Link, {
				to: "/entrar",
				className: "mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground",
				children: [/* @__PURE__ */ jsx(ArrowLeft, {
					className: "h-4 w-4",
					"aria-hidden": "true"
				}), " Voltar para o login"]
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "text-2xl font-bold",
				children: "Criar nova senha"
			}),
			!ready ? /* @__PURE__ */ jsxs("p", {
				className: "mt-6 flex items-center gap-2 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ jsx(Loader2, {
					className: "h-4 w-4 animate-spin",
					"aria-hidden": "true"
				}), " Validando seu link..."]
			}) : !valid ? /* @__PURE__ */ jsx("p", {
				className: "mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm",
				children: "Este link de recuperação expirou ou já foi usado. Volte ao login e peça um novo em “Esqueci minha senha”."
			}) : /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				className: "mt-6 space-y-4",
				noValidate: true,
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ jsx(Label, {
								htmlFor: "password",
								children: "Nova senha"
							}),
							/* @__PURE__ */ jsx(Input, {
								id: "password",
								type: "password",
								autoComplete: "new-password",
								value: password,
								onChange: (event) => setPassword(event.target.value),
								className: "h-12 bg-card",
								required: true
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: "Ao menos 6 caracteres, com letras e números."
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "confirm",
							children: "Confirmar nova senha"
						}), /* @__PURE__ */ jsx(Input, {
							id: "confirm",
							type: "password",
							autoComplete: "new-password",
							value: confirm,
							onChange: (event) => setConfirm(event.target.value),
							className: "h-12 bg-card",
							required: true
						})]
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
						}) : null, "Salvar nova senha"]
					})
				]
			})
		]
	});
}
//#endregion
export { ResetPasswordPage as component };
