import { t as supabase } from "./client-C8NJlSke.js";
import { a as useIsAdmin, i as useAuth, n as Route } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { t as EmptyState } from "./EmptyState-BvU2HfYM.js";
import { t as StorageImage } from "./StorageImage-CN2VpAnu.js";
import { a as categoryLabel, i as STATUS_ORDER, o as formatDate, r as STATUS } from "./sos-CS-s4mgb.js";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
//#region src/routes/_authenticated/admin.denuncia.$id.tsx?tsr-split=component
function AdminReportPage() {
	const { id } = Route.useParams();
	const { user } = useAuth();
	const { data: isAdmin, isLoading: loadingRole } = useIsAdmin();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [status, setStatus] = useState("");
	const [note, setNote] = useState("");
	const [photo, setPhoto] = useState(null);
	const { data, isLoading } = useQuery({
		queryKey: ["admin-report", id],
		enabled: Boolean(isAdmin),
		queryFn: async () => {
			const { data: report, error } = await supabase.from("reports").select("*").eq("id", id).maybeSingle();
			if (error) throw error;
			const { data: events } = await supabase.from("report_events").select("id, status, note, created_at").eq("report_id", id).order("created_at", { ascending: true });
			return {
				report,
				events: events ?? []
			};
		}
	});
	const save = useMutation({
		mutationFn: async () => {
			const report = data?.report;
			if (!report) throw new Error("Denúncia não encontrada.");
			const nextStatus = status || report.status;
			let resolutionPath = report.resolution_image_url;
			if (photo) {
				const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
				const path = `${user.id}/resolucao-${report.id}-${Date.now()}.${ext}`;
				const { error: uploadError } = await supabase.storage.from("denuncias").upload(path, photo);
				if (uploadError) throw uploadError;
				resolutionPath = path;
			}
			const { error } = await supabase.from("reports").update({
				status: nextStatus,
				admin_note: note.trim() ? note.trim() : report.admin_note,
				resolution_image_url: resolutionPath,
				resolved_at: nextStatus === "concluida" ? (/* @__PURE__ */ new Date()).toISOString() : report.resolved_at
			}).eq("id", report.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Denúncia atualizada com sucesso.");
			setPhoto(null);
			setNote("");
			queryClient.invalidateQueries({ queryKey: ["admin-report", id] });
			queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
		},
		onError: (error) => toast.error(error.message || "Não foi possível atualizar.")
	});
	if (loadingRole || isLoading) return /* @__PURE__ */ jsx(AppShell, {
		title: "Denúncia",
		children: /* @__PURE__ */ jsx("div", {
			className: "flex justify-center py-10",
			children: /* @__PURE__ */ jsx(Loader2, {
				className: "h-6 w-6 animate-spin text-leaf-deep",
				"aria-hidden": "true"
			})
		})
	});
	if (!isAdmin) return /* @__PURE__ */ jsx(AppShell, {
		title: "Denúncia",
		children: /* @__PURE__ */ jsx(EmptyState, {
			icon: ShieldCheck,
			title: "Acesso restrito",
			description: "Esta área é exclusiva para contas da Prefeitura."
		})
	});
	const report = data?.report;
	if (!report) return /* @__PURE__ */ jsx(AppShell, {
		title: "Denúncia",
		children: /* @__PURE__ */ jsx("p", {
			role: "alert",
			className: "surface-card p-4 text-sm",
			children: "Denúncia não encontrada."
		})
	});
	const current = STATUS[report.status];
	return /* @__PURE__ */ jsxs(AppShell, {
		title: report.protocol,
		subtitle: categoryLabel(report.category),
		children: [
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => navigate({ to: "/admin" }),
				className: "mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground",
				children: [/* @__PURE__ */ jsx(ArrowLeft, {
					className: "h-4 w-4",
					"aria-hidden": "true"
				}), " Painel"]
			}),
			/* @__PURE__ */ jsxs("span", {
				className: `inline-block rounded-full border px-3 py-1 text-xs font-bold ${current.className}`,
				children: ["Status atual: ", current.label]
			}),
			/* @__PURE__ */ jsx(StorageImage, {
				path: report.image_url,
				alt: "Foto enviada pelo cidadão",
				className: "mt-3 h-52 w-full rounded-2xl"
			}),
			/* @__PURE__ */ jsxs("dl", {
				className: "surface-card mt-3 space-y-2 p-4 text-sm",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
						className: "text-xs text-muted-foreground",
						children: "Local"
					}), /* @__PURE__ */ jsx("dd", {
						className: "font-semibold",
						children: report.location_text || "Não informado"
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
						className: "text-xs text-muted-foreground",
						children: "Descrição"
					}), /* @__PURE__ */ jsx("dd", { children: report.description || "Sem descrição" })] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
						className: "text-xs text-muted-foreground",
						children: "Recebida em"
					}), /* @__PURE__ */ jsx("dd", { children: formatDate(report.created_at) })] })
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "surface-card mt-3 space-y-3 p-4",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "text-sm font-bold",
						children: "Atualizar denúncia"
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						htmlFor: "status",
						className: "text-xs font-semibold text-muted-foreground",
						children: "Novo status"
					}), /* @__PURE__ */ jsx("select", {
						id: "status",
						value: status || report.status,
						onChange: (event) => setStatus(event.target.value),
						className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm",
						children: [...STATUS_ORDER, "cancelada"].map((item) => /* @__PURE__ */ jsx("option", {
							value: item,
							children: STATUS[item].label
						}, item))
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						htmlFor: "note",
						className: "text-xs font-semibold text-muted-foreground",
						children: "Observação para o cidadão"
					}), /* @__PURE__ */ jsx("textarea", {
						id: "note",
						value: note,
						onChange: (event) => setNote(event.target.value),
						rows: 3,
						placeholder: "Ex.: equipe de limpeza esteve no local e removeu o entulho.",
						className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						htmlFor: "resolution",
						className: "text-xs font-semibold text-muted-foreground",
						children: "Foto da solução (opcional)"
					}), /* @__PURE__ */ jsx("input", {
						id: "resolution",
						type: "file",
						accept: "image/*",
						onChange: (event) => setPhoto(event.target.files?.[0] ?? null),
						className: "mt-1 w-full text-xs"
					})] }),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => save.mutate(),
						disabled: save.isPending,
						className: "gradient-leaf w-full rounded-xl px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60",
						children: save.isPending ? "Salvando..." : "Salvar atualização"
					})
				]
			}),
			report.resolution_image_url ? /* @__PURE__ */ jsxs("section", {
				className: "mt-3",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-2 text-sm font-bold",
					children: "Foto da solução"
				}), /* @__PURE__ */ jsx(StorageImage, {
					path: report.resolution_image_url,
					alt: "Foto da solução enviada pela Prefeitura",
					className: "h-52 w-full rounded-2xl"
				})]
			}) : null,
			/* @__PURE__ */ jsxs("section", {
				className: "mt-4",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-2 text-sm font-bold",
					children: "Histórico"
				}), /* @__PURE__ */ jsx("ul", {
					className: "space-y-2",
					children: data.events.map((event) => /* @__PURE__ */ jsxs("li", {
						className: "surface-card p-3 text-sm",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-semibold",
								children: STATUS[event.status].label
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-muted-foreground",
								children: formatDate(event.created_at)
							})]
						}), event.note ? /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: event.note
						}) : null]
					}, event.id))
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-4 text-center text-xs text-muted-foreground",
				children: /* @__PURE__ */ jsx(Link, {
					to: "/app",
					className: "font-semibold",
					children: "Voltar ao início"
				})
			})
		]
	});
}
//#endregion
export { AdminReportPage as component };
