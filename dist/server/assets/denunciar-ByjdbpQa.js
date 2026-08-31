import { t as supabase } from "./client-C8NJlSke.js";
import { i as useAuth } from "./router-BaP0cReg.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { a as categoryLabel, t as CATEGORIES } from "./sos-CS-s4mgb.js";
import { t as Progress } from "./progress-DOIEKRJF.js";
import { t as MapCanvas } from "./MapCanvas-CrGKkUU8.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { t as Input } from "./input-B8Q2ztVi.js";
import { t as Label } from "./label-DBD1bRRP.js";
import { t as useSound } from "./useSound-D-EGIKxq.js";
import { n as reverseGeocode, t as geocode } from "./geocode-STlvuK6E.js";
import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { ArrowLeft, Camera, CheckCircle2, Crosshair, Loader2, MapPin, Search } from "lucide-react";
import { z } from "zod";
//#region src/components/ui/textarea.tsx
var Textarea = React.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ jsx("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
//#endregion
//#region src/routes/_authenticated/denunciar.tsx?tsr-split=component
var descriptionSchema = z.string().trim().min(10, "Descreva com pelo menos 10 caracteres").max(1e3);
function NewReportPage() {
	useNavigate();
	const { user } = useAuth();
	const { play } = useSound();
	const [step, setStep] = useState(1);
	const [category, setCategory] = useState(null);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const [searching, setSearching] = useState(false);
	const [picked, setPicked] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [photo, setPhoto] = useState(null);
	const [photoPreview, setPhotoPreview] = useState(null);
	const [description, setDescription] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [protocol, setProtocol] = useState(null);
	const [error, setError] = useState(null);
	async function search(event) {
		event.preventDefault();
		setError(null);
		if (query.trim().length < 3) {
			setError("Digite ao menos 3 caracteres.");
			return;
		}
		setSearching(true);
		try {
			const found = await geocode(query);
			setResults(found);
			if (found.length === 0) setError("Não encontramos esse lugar. Tente outro ponto de referência.");
		} catch {
			setError("Não foi possível pesquisar agora. Tente novamente.");
		} finally {
			setSearching(false);
		}
	}
	function useCurrentLocation() {
		if (!navigator.geolocation) {
			toast.error("Seu aparelho não oferece localização.");
			return;
		}
		navigator.geolocation.getCurrentPosition(async (position) => {
			const { latitude, longitude } = position.coords;
			const label = await reverseGeocode(latitude, longitude);
			setPicked({
				label,
				lat: latitude,
				lon: longitude
			});
			setConfirmed(false);
		}, () => toast.error("Não conseguimos acessar sua localização. Pesquise o endereço."));
	}
	function choosePhoto(file) {
		setPhoto(file);
		setPhotoPreview(file ? URL.createObjectURL(file) : null);
	}
	async function submit() {
		setError(null);
		const parsed = descriptionSchema.safeParse(description);
		if (!category || !parsed.success || !user) {
			setError(parsed.success ? "Escolha uma categoria." : parsed.error.issues[0].message);
			return;
		}
		setSubmitting(true);
		try {
			let imagePath = null;
			if (photo) {
				const mimeExtension = (photo.type.split("/")[1] ?? "jpg").replace("jpeg", "jpg");
				const path = `${user.id}/${crypto.randomUUID()}.${mimeExtension}`;
				const { error: uploadError } = await supabase.storage.from("denuncias").upload(path, photo, {
					contentType: photo.type || "image/jpeg",
					upsert: false
				});
				if (uploadError) {
					setSubmitting(false);
					setError(`Não conseguimos enviar a foto: ${uploadError.message}`);
					return;
				}
				imagePath = path;
			}
			const { data, error: insertError } = await supabase.from("reports").insert({
				user_id: user.id,
				protocol: "",
				category,
				description: parsed.data,
				image_url: imagePath,
				location_text: picked?.label ?? query.trim(),
				latitude: picked?.lat ?? null,
				longitude: picked?.lon ?? null
			}).select("protocol").single();
			if (insertError) throw insertError;
			setProtocol(data.protocol);
			play("enviado");
		} catch (submitError) {
			const message = submitError instanceof Error ? submitError.message : "";
			setError(message ? `Não foi possível enviar sua denúncia: ${message}` : "Não foi possível enviar sua denúncia. Tente novamente.");
		} finally {
			setSubmitting(false);
		}
	}
	if (protocol) return /* @__PURE__ */ jsx(AppShell, {
		title: "Denúncia enviada",
		children: /* @__PURE__ */ jsxs("div", {
			className: "surface-card flex flex-col items-center gap-3 p-6 text-center",
			children: [
				/* @__PURE__ */ jsx(CheckCircle2, {
					className: "h-14 w-14 text-success",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "text-xl font-bold",
					children: "Denúncia registrada com sucesso!"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted-foreground",
					children: "Guarde seu número de protocolo:"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "rounded-xl bg-primary/20 px-4 py-2 text-lg font-extrabold text-leaf-deep",
					children: protocol
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted-foreground",
					children: "Você ganhou +50 pontos e +50 XP."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-2 flex w-full flex-col gap-2",
					children: [/* @__PURE__ */ jsx(Button, {
						asChild: true,
						className: "rounded-2xl py-6 font-bold",
						children: /* @__PURE__ */ jsx(Link, {
							to: "/minhas-denuncias",
							children: "Acompanhar denúncia"
						})
					}), /* @__PURE__ */ jsx(Button, {
						asChild: true,
						variant: "outline",
						className: "rounded-2xl bg-card py-6 font-bold",
						children: /* @__PURE__ */ jsx(Link, {
							to: "/app",
							children: "Voltar para o início"
						})
					})]
				})
			]
		})
	});
	return /* @__PURE__ */ jsxs(AppShell, {
		title: "Nova denúncia",
		subtitle: `Etapa ${step} de 5`,
		children: [
			/* @__PURE__ */ jsx(Progress, {
				value: step / 5 * 100,
				className: "mb-4 h-2"
			}),
			step === 1 ? /* @__PURE__ */ jsxs("section", {
				"aria-labelledby": "step1",
				children: [
					/* @__PURE__ */ jsx("h2", {
						id: "step1",
						className: "mb-3 text-lg font-bold",
						children: "O que aconteceu?"
					}),
					/* @__PURE__ */ jsx("ul", {
						className: "space-y-2",
						children: CATEGORIES.map((item) => {
							const Icon = item.icon;
							const active = category === item.id;
							return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setCategory(item.id),
								"aria-pressed": active,
								className: `flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left ${active ? "border-primary bg-primary/15" : "border-border bg-card"}`,
								children: [/* @__PURE__ */ jsx("span", {
									className: "flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-leaf-deep",
									children: /* @__PURE__ */ jsx(Icon, {
										className: "h-5 w-5",
										"aria-hidden": "true"
									})
								}), /* @__PURE__ */ jsxs("span", {
									className: "flex-1",
									children: [/* @__PURE__ */ jsx("span", {
										className: "block font-bold",
										children: item.label
									}), /* @__PURE__ */ jsx("span", {
										className: "block text-xs text-muted-foreground",
										children: item.hint
									})]
								})]
							}) }, item.id);
						})
					}),
					/* @__PURE__ */ jsx(Button, {
						className: "mt-4 w-full rounded-2xl py-6 font-bold",
						disabled: !category,
						onClick: () => setStep(2),
						children: "Continuar"
					})
				]
			}) : null,
			step === 2 ? /* @__PURE__ */ jsxs("section", {
				"aria-labelledby": "step2",
				children: [
					/* @__PURE__ */ jsx("h2", {
						id: "step2",
						className: "mb-1 text-lg font-bold",
						children: "Onde está o problema?"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mb-3 text-sm text-muted-foreground",
						children: "Você não precisa compartilhar sua localização. Digite o endereço ou um ponto de referência."
					}),
					/* @__PURE__ */ jsxs("form", {
						onSubmit: search,
						className: "flex gap-2",
						children: [/* @__PURE__ */ jsx(Input, {
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Digite o endereço ou ponto de referência...",
							"aria-label": "Endereço ou ponto de referência",
							className: "h-12 bg-card",
							maxLength: 200
						}), /* @__PURE__ */ jsxs(Button, {
							type: "submit",
							disabled: searching,
							className: "h-12 w-12 shrink-0 rounded-xl p-0",
							children: [searching ? /* @__PURE__ */ jsx(Loader2, {
								className: "h-4 w-4 animate-spin",
								"aria-hidden": "true"
							}) : /* @__PURE__ */ jsx(Search, {
								className: "h-4 w-4",
								"aria-hidden": "true"
							}), /* @__PURE__ */ jsx("span", {
								className: "sr-only",
								children: "Pesquisar endereço"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs(Button, {
						type: "button",
						variant: "outline",
						onClick: useCurrentLocation,
						className: "mt-2 w-full rounded-2xl bg-card py-5 font-semibold",
						children: [/* @__PURE__ */ jsx(Crosshair, {
							className: "h-4 w-4",
							"aria-hidden": "true"
						}), " Usar minha localização atual (opcional)"]
					}),
					results.length > 0 ? /* @__PURE__ */ jsx("ul", {
						className: "mt-3 space-y-2",
						children: results.map((result) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => {
								setPicked(result);
								setConfirmed(false);
							},
							className: `flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm ${picked?.label === result.label ? "border-primary bg-primary/10" : "border-border bg-card"}`,
							children: [/* @__PURE__ */ jsx(MapPin, {
								className: "mt-0.5 h-4 w-4 shrink-0 text-leaf-deep",
								"aria-hidden": "true"
							}), result.label]
						}) }, `${result.lat}-${result.lon}`))
					}) : null,
					picked ? /* @__PURE__ */ jsxs("div", {
						className: "mt-4 space-y-2",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "h-56 overflow-hidden rounded-2xl border border-border",
								children: /* @__PURE__ */ jsx(MapCanvas, {
									center: [picked.lat, picked.lon],
									zoom: 16,
									markers: [{
										id: "pick",
										lat: picked.lat,
										lon: picked.lon,
										title: "Local da denúncia"
									}],
									onPick: (lat, lon) => {
										setPicked({
											label: picked.label,
											lat,
											lon
										});
										setConfirmed(false);
									}
								})
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-sm font-semibold",
								children: "Essa localização está correta?"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: picked.label
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ jsx(Button, {
									type: "button",
									onClick: () => {
										setConfirmed(true);
										setStep(3);
									},
									className: "flex-1 rounded-2xl py-5 font-bold",
									children: "Confirmar localização"
								}), /* @__PURE__ */ jsx(Button, {
									type: "button",
									variant: "outline",
									onClick: () => {
										setPicked(null);
										setConfirmed(false);
									},
									className: "flex-1 rounded-2xl bg-card py-5 font-bold",
									children: "Alterar localização"
								})]
							})
						]
					}) : null,
					error ? /* @__PURE__ */ jsx("p", {
						role: "alert",
						className: "mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm",
						children: error
					}) : null,
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4 flex gap-2",
						children: [/* @__PURE__ */ jsxs(Button, {
							variant: "ghost",
							onClick: () => setStep(1),
							className: "flex-1",
							children: [/* @__PURE__ */ jsx(ArrowLeft, {
								className: "h-4 w-4",
								"aria-hidden": "true"
							}), " Voltar"]
						}), /* @__PURE__ */ jsx(Button, {
							onClick: () => setStep(3),
							disabled: query.trim().length < 3 && !picked,
							className: "flex-1 rounded-2xl py-5 font-bold",
							children: "Continuar"
						})]
					})
				]
			}) : null,
			step === 3 ? /* @__PURE__ */ jsxs("section", {
				"aria-labelledby": "step3",
				children: [
					/* @__PURE__ */ jsx("h2", {
						id: "step3",
						className: "mb-1 text-lg font-bold",
						children: "Adicione uma foto"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mb-3 text-sm text-muted-foreground",
						children: "Tire uma foto ou escolha da galeria (opcional)."
					}),
					/* @__PURE__ */ jsx(Label, {
						htmlFor: "photo",
						className: "flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card text-sm font-semibold text-muted-foreground",
						children: photoPreview ? /* @__PURE__ */ jsx("img", {
							src: photoPreview,
							alt: "Pré-visualização da foto escolhida",
							className: "h-full w-full rounded-2xl object-cover"
						}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Camera, {
							className: "h-8 w-8 text-leaf-deep",
							"aria-hidden": "true"
						}), "Toque para adicionar uma foto"] })
					}),
					/* @__PURE__ */ jsx(Input, {
						id: "photo",
						type: "file",
						accept: "image/*",
						capture: "environment",
						className: "sr-only",
						onChange: (event) => choosePhoto(event.target.files?.[0] ?? null)
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4 flex gap-2",
						children: [/* @__PURE__ */ jsxs(Button, {
							variant: "ghost",
							onClick: () => setStep(2),
							className: "flex-1",
							children: [/* @__PURE__ */ jsx(ArrowLeft, {
								className: "h-4 w-4",
								"aria-hidden": "true"
							}), " Voltar"]
						}), /* @__PURE__ */ jsx(Button, {
							onClick: () => setStep(4),
							className: "flex-1 rounded-2xl py-5 font-bold",
							children: "Continuar"
						})]
					})
				]
			}) : null,
			step === 4 ? /* @__PURE__ */ jsxs("section", {
				"aria-labelledby": "step4",
				children: [
					/* @__PURE__ */ jsx("h2", {
						id: "step4",
						className: "mb-3 text-lg font-bold",
						children: "Conte o que aconteceu"
					}),
					/* @__PURE__ */ jsx(Textarea, {
						value: description,
						onChange: (event) => setDescription(event.target.value),
						placeholder: "Conte o que aconteceu...",
						"aria-label": "Descrição do problema",
						maxLength: 1e3,
						className: "min-h-40 bg-card"
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-1 text-right text-xs text-muted-foreground",
						children: [description.length, "/1000"]
					}),
					error ? /* @__PURE__ */ jsx("p", {
						role: "alert",
						className: "mt-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm",
						children: error
					}) : null,
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4 flex gap-2",
						children: [/* @__PURE__ */ jsxs(Button, {
							variant: "ghost",
							onClick: () => setStep(3),
							className: "flex-1",
							children: [/* @__PURE__ */ jsx(ArrowLeft, {
								className: "h-4 w-4",
								"aria-hidden": "true"
							}), " Voltar"]
						}), /* @__PURE__ */ jsx(Button, {
							onClick: () => {
								const parsed = descriptionSchema.safeParse(description);
								if (!parsed.success) {
									setError(parsed.error.issues[0].message);
									return;
								}
								setError(null);
								setStep(5);
							},
							className: "flex-1 rounded-2xl py-5 font-bold",
							children: "Revisar"
						})]
					})
				]
			}) : null,
			step === 5 ? /* @__PURE__ */ jsxs("section", {
				"aria-labelledby": "step5",
				className: "space-y-3",
				children: [
					/* @__PURE__ */ jsx("h2", {
						id: "step5",
						className: "text-lg font-bold",
						children: "Revise sua denúncia"
					}),
					/* @__PURE__ */ jsxs("dl", {
						className: "surface-card space-y-3 p-4 text-sm",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
								className: "font-semibold text-muted-foreground",
								children: "Categoria"
							}), /* @__PURE__ */ jsx("dd", {
								className: "font-bold",
								children: category ? categoryLabel(category) : "—"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("dt", {
									className: "font-semibold text-muted-foreground",
									children: "Local"
								}),
								/* @__PURE__ */ jsx("dd", { children: picked?.label ?? (query || "Não informado") }),
								/* @__PURE__ */ jsx("dd", {
									className: "text-xs text-muted-foreground",
									children: picked ? confirmed ? "Localização confirmada no mapa" : "Localização selecionada" : "Sem coordenadas"
								})
							] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
								className: "font-semibold text-muted-foreground",
								children: "Descrição"
							}), /* @__PURE__ */ jsx("dd", { children: description })] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
								className: "font-semibold text-muted-foreground",
								children: "Foto"
							}), /* @__PURE__ */ jsx("dd", { children: photoPreview ? /* @__PURE__ */ jsx("img", {
								src: photoPreview,
								alt: "Foto da denúncia",
								className: "mt-1 h-40 w-full rounded-xl object-cover"
							}) : "Nenhuma foto adicionada" })] })
						]
					}),
					error ? /* @__PURE__ */ jsx("p", {
						role: "alert",
						className: "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm",
						children: error
					}) : null,
					/* @__PURE__ */ jsxs("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ jsxs(Button, {
							variant: "ghost",
							onClick: () => setStep(4),
							className: "flex-1",
							children: [/* @__PURE__ */ jsx(ArrowLeft, {
								className: "h-4 w-4",
								"aria-hidden": "true"
							}), " Voltar"]
						}), /* @__PURE__ */ jsxs(Button, {
							onClick: submit,
							disabled: submitting,
							className: "flex-1 rounded-2xl py-5 font-bold",
							children: [submitting ? /* @__PURE__ */ jsx(Loader2, {
								className: "h-4 w-4 animate-spin",
								"aria-hidden": "true"
							}) : null, "Enviar denúncia"]
						})]
					})
				]
			}) : null
		]
	});
}
//#endregion
export { NewReportPage as component };
