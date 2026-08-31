import { t as supabase } from "./client-C8NJlSke.js";
import { r as Route } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { t as StorageImage } from "./StorageImage-CN2VpAnu.js";
import { a as categoryLabel, i as STATUS_ORDER, o as formatDate, r as STATUS } from "./sos-CS-s4mgb.js";
import { t as MapCanvas } from "./MapCanvas-CrGKkUU8.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
//#region src/routes/_authenticated/denuncia.$id.tsx?tsr-split=component
function ReportDetail() {
	const { id } = Route.useParams();
	const { data, isLoading, isError } = useQuery({
		queryKey: ["report", id],
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
	if (isLoading) return /* @__PURE__ */ jsx(AppShell, {
		title: "Denúncia",
		children: /* @__PURE__ */ jsx("div", {
			className: "flex justify-center py-10",
			children: /* @__PURE__ */ jsx(Loader2, {
				className: "h-6 w-6 animate-spin text-leaf-deep",
				"aria-hidden": "true"
			})
		})
	});
	if (isError || !data?.report) return /* @__PURE__ */ jsx(AppShell, {
		title: "Denúncia",
		children: /* @__PURE__ */ jsx("p", {
			role: "alert",
			className: "surface-card p-4 text-sm",
			children: "Não foi possível carregar os dados. Tente novamente."
		})
	});
	const report = data.report;
	const status = STATUS[report.status];
	return /* @__PURE__ */ jsxs(AppShell, {
		title: report.protocol,
		subtitle: categoryLabel(report.category),
		children: [
			/* @__PURE__ */ jsxs(Link, {
				to: "/minhas-denuncias",
				className: "mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground",
				children: [/* @__PURE__ */ jsx(ArrowLeft, {
					className: "h-4 w-4",
					"aria-hidden": "true"
				}), " Minhas denúncias"]
			}),
			/* @__PURE__ */ jsxs("span", {
				className: `inline-block rounded-full border px-3 py-1 text-xs font-bold ${status.className}`,
				children: ["Status: ", status.label]
			}),
			/* @__PURE__ */ jsx(StorageImage, {
				path: report.image_url,
				alt: "Foto enviada na denúncia",
				className: "mt-3 h-52 w-full rounded-2xl"
			}),
			/* @__PURE__ */ jsxs("dl", {
				className: "surface-card mt-3 space-y-3 p-4 text-sm",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
						className: "font-semibold text-muted-foreground",
						children: "Descrição"
					}), /* @__PURE__ */ jsx("dd", { children: report.description || "—" })] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
						className: "font-semibold text-muted-foreground",
						children: "Local"
					}), /* @__PURE__ */ jsx("dd", { children: report.location_text || "Não informado" })] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
						className: "font-semibold text-muted-foreground",
						children: "Registrada em"
					}), /* @__PURE__ */ jsx("dd", { children: formatDate(report.created_at) })] })
				]
			}),
			report.latitude && report.longitude ? /* @__PURE__ */ jsx("div", {
				className: "mt-3 h-48 overflow-hidden rounded-2xl border border-border",
				children: /* @__PURE__ */ jsx(MapCanvas, {
					center: [report.latitude, report.longitude],
					zoom: 16,
					markers: [{
						id: report.id,
						lat: report.latitude,
						lon: report.longitude,
						title: report.protocol
					}]
				})
			}) : null,
			/* @__PURE__ */ jsxs("section", {
				className: "mt-4",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground",
					children: "Linha do tempo"
				}), /* @__PURE__ */ jsx("ol", {
					className: "surface-card space-y-3 p-4",
					children: STATUS_ORDER.map((key) => {
						const event = data.events.find((item) => item.status === key);
						return /* @__PURE__ */ jsxs("li", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: `mt-1 h-3 w-3 shrink-0 rounded-full ${event ? "bg-primary" : "bg-border"}`,
								"aria-hidden": "true"
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-sm",
								children: [/* @__PURE__ */ jsx("p", {
									className: `font-bold ${event ? "" : "text-muted-foreground"}`,
									children: STATUS[key].label
								}), /* @__PURE__ */ jsxs("p", {
									className: "text-xs text-muted-foreground",
									children: [event ? formatDate(event.created_at) : "Aguardando", event?.note ? ` · ${event.note}` : ""]
								})]
							})]
						}, key);
					})
				})]
			}),
			report.status === "concluida" ? /* @__PURE__ */ jsxs("section", {
				className: "surface-card mt-4 space-y-2 p-4",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "text-base font-bold",
						children: "Solução da Prefeitura"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm",
						children: report.admin_note || "Atendimento realizado."
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-xs text-muted-foreground",
						children: ["Concluída em ", formatDate(report.resolved_at)]
					}),
					/* @__PURE__ */ jsx(StorageImage, {
						path: report.resolution_image_url,
						alt: "Foto após o atendimento",
						className: "h-48 w-full rounded-xl"
					})
				]
			}) : null
		]
	});
}
//#endregion
export { ReportDetail as component };
