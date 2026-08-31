import { t as supabase } from "./client-C8NJlSke.js";
import { i as useAuth, o as useProfile } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { n as toMotif, t as ItemArt } from "./ItemArt-DqtzmCsi.js";
import { r as avatarValueFor, t as FREE_AVATARS } from "./UserAvatar-CyI08uKa.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { t as Input } from "./input-B8Q2ztVi.js";
import { t as Label } from "./label-DBD1bRRP.js";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2, Lock } from "lucide-react";
import { z } from "zod";
//#region src/routes/_authenticated/editar-perfil.tsx?tsr-split=component
var schema = z.object({
	fullName: z.string().trim().min(3, "Informe seu nome completo").max(120),
	username: z.string().trim().min(3, "O nome de usuário precisa de ao menos 3 caracteres").max(24).regex(/^[a-zA-Z0-9_.]+$/, "Use apenas letras, números, ponto ou _")
});
function EditProfilePage() {
	const { user } = useAuth();
	const { data: profile } = useProfile();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [fullName, setFullName] = useState("");
	const [username, setUsername] = useState("");
	const [avatar, setAvatar] = useState(avatarValueFor("sprout"));
	const [error, setError] = useState(null);
	useEffect(() => {
		if (!profile) return;
		setFullName(profile.full_name ?? "");
		setUsername(profile.username ?? "");
		if (profile.avatar_url) setAvatar(profile.avatar_url);
	}, [profile]);
	const { data: shopAvatars } = useQuery({
		queryKey: ["shop-avatars", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const [catalog, owned] = await Promise.all([supabase.from("shop_items").select("id, name, icon, price").eq("category", "avatares").order("price"), supabase.from("inventory").select("item_id").eq("user_id", user.id)]);
			if (catalog.error) throw catalog.error;
			const ownedIds = new Set((owned.data ?? []).map((row) => row.item_id));
			return (catalog.data ?? []).map((item) => ({
				...item,
				owned: ownedIds.has(item.id)
			}));
		}
	});
	const save = useMutation({
		mutationFn: async () => {
			const parsed = schema.safeParse({
				fullName,
				username
			});
			if (!parsed.success) throw new Error(parsed.error.issues[0].message);
			const { error: updateError } = await supabase.from("profiles").update({
				full_name: parsed.data.fullName,
				username: parsed.data.username,
				avatar_url: avatar
			}).eq("id", user.id);
			if (updateError) throw updateError;
		},
		onSuccess: () => {
			toast.success("Perfil atualizado!");
			queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
			navigate({ to: "/perfil" });
		},
		onError: (mutationError) => setError(mutationError.message)
	});
	return /* @__PURE__ */ jsxs(AppShell, {
		title: "Editar perfil",
		subtitle: "Deixe sua conta com a sua cara",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center gap-2",
				children: [/* @__PURE__ */ jsx(ItemArt, {
					motif: toMotif(avatar.replace("preset:", "")),
					price: shopAvatars?.find((item) => avatarValueFor(item.icon) === avatar)?.price ?? 0,
					className: "h-24 w-24",
					label: "Prévia do seu ícone de perfil"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-muted-foreground",
					children: "Prévia do seu ícone"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-5 space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "fullName",
						children: "Nome completo"
					}), /* @__PURE__ */ jsx(Input, {
						id: "fullName",
						value: fullName,
						onChange: (event) => setFullName(event.target.value),
						className: "h-12 bg-card"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "username",
						children: "Nome de usuário"
					}), /* @__PURE__ */ jsx(Input, {
						id: "username",
						value: username,
						onChange: (event) => setUsername(event.target.value),
						className: "h-12 bg-card"
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground",
					children: "Ícones gratuitos"
				}), /* @__PURE__ */ jsx("ul", {
					className: "grid grid-cols-4 gap-3",
					children: FREE_AVATARS.map((item) => {
						const value = avatarValueFor(item.icon);
						const active = avatar === value;
						return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setAvatar(value),
							"aria-pressed": active,
							className: `flex w-full flex-col items-center gap-1 rounded-2xl border-2 p-2 ${active ? "border-primary bg-primary/15" : "border-border bg-card"}`,
							children: [/* @__PURE__ */ jsx(ItemArt, {
								motif: toMotif(item.icon),
								className: "h-12 w-12"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[10px] font-bold",
								children: item.name
							})]
						}) }, item.id);
					})
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground",
					children: "Ícones da Loja Verde"
				}), /* @__PURE__ */ jsx("ul", {
					className: "grid grid-cols-3 gap-3",
					children: (shopAvatars ?? []).map((item) => {
						const value = avatarValueFor(item.icon);
						const active = avatar === value;
						return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
							type: "button",
							disabled: !item.owned,
							onClick: () => setAvatar(value),
							"aria-pressed": active,
							className: `flex w-full flex-col items-center gap-1 rounded-2xl border-2 p-2 disabled:opacity-60 ${active ? "border-primary bg-primary/15" : "border-border bg-card"}`,
							children: [
								/* @__PURE__ */ jsx(ItemArt, {
									motif: toMotif(item.icon),
									price: item.price,
									className: "h-14 w-14"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] font-bold leading-tight",
									children: item.name
								}),
								/* @__PURE__ */ jsx("span", {
									className: "flex items-center gap-1 text-[10px] font-semibold text-muted-foreground",
									children: item.owned ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Check, {
										className: "h-3 w-3",
										"aria-hidden": "true"
									}), " Seu"] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
										/* @__PURE__ */ jsx(Lock, {
											className: "h-3 w-3",
											"aria-hidden": "true"
										}),
										" ",
										item.price,
										" pts"
									] })
								})
							]
						}) }, item.id);
					})
				})]
			}),
			error ? /* @__PURE__ */ jsx("p", {
				role: "alert",
				className: "mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm",
				children: error
			}) : null,
			/* @__PURE__ */ jsxs(Button, {
				onClick: () => save.mutate(),
				disabled: save.isPending,
				className: "mt-6 w-full rounded-2xl py-6 font-bold",
				children: [save.isPending ? /* @__PURE__ */ jsx(Loader2, {
					className: "h-4 w-4 animate-spin",
					"aria-hidden": "true"
				}) : null, "Salvar alterações"]
			})
		]
	});
}
//#endregion
export { EditProfilePage as component };
