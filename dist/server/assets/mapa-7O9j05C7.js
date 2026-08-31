import { t as supabase } from "./client-C8NJlSke.js";
import { i as useAuth } from "./router-BaP0cReg.js";
import { t as AppShell } from "./AppShell-DwfDQFAb.js";
import { a as categoryLabel, r as STATUS } from "./sos-CS-s4mgb.js";
import { t as MapCanvas } from "./MapCanvas-CrGKkUU8.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { t as Input } from "./input-B8Q2ztVi.js";
import { t as geocode } from "./geocode-STlvuK6E.js";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, MapPinned, Search } from "lucide-react";
//#region src/routes/_authenticated/mapa.tsx?tsr-split=component
var DEFAULT_CENTER = [-14.235, -51.9253];
function MapPage() {
	const { user } = useAuth();
	const [center, setCenter] = useState(DEFAULT_CENTER);
	const [zoom, setZoom] = useState(4);
	const [query, setQuery] = useState("");
	const [searching, setSearching] = useState(false);
	const { data: reports = [], isLoading, isError } = useQuery({
		queryKey: ["map-reports", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const { data, error } = await supabase.from("reports").select("id, protocol, category, status, latitude, longitude, location_text").not("latitude", "is", null);
			if (error) throw error;
			return data ?? [];
		}
	});
	const markers = useMemo(() => reports.filter((report) => report.latitude !== null && report.longitude !== null).map((report) => ({
		id: report.id,
		lat: report.latitude,
		lon: report.longitude,
		title: `${categoryLabel(report.category)} — ${report.protocol}`,
		subtitle: `${STATUS[report.status].label} · ${report.location_text}`
	})), [reports]);
	async function handleSearch(event) {
		event.preventDefault();
		if (query.trim().length < 3) return;
		setSearching(true);
		try {
			const results = await geocode(query);
			if (results.length === 0) {
				toast.error("Não encontramos esse lugar. Tente outro endereço ou ponto de referência.");
				return;
			}
			setCenter([results[0].lat, results[0].lon]);
			setZoom(15);
		} catch {
			toast.error("Não foi possível pesquisar agora. Tente novamente.");
		} finally {
			setSearching(false);
		}
	}
	return /* @__PURE__ */ jsx(AppShell, {
		fullBleed: true,
		children: /* @__PURE__ */ jsxs("div", {
			className: "relative h-[calc(100vh-5.5rem)] w-full",
			children: [
				/* @__PURE__ */ jsx(MapCanvas, {
					center,
					zoom,
					markers
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-events-none absolute inset-x-0 top-0 z-[500] space-y-2 p-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "pointer-events-auto flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(Link, {
								to: "/app",
								"aria-label": "Voltar para o início",
								className: "flex h-11 w-11 items-center justify-center rounded-full bg-card shadow-card",
								children: /* @__PURE__ */ jsx(ArrowLeft, {
									className: "h-5 w-5",
									"aria-hidden": "true"
								})
							}), /* @__PURE__ */ jsxs("form", {
								onSubmit: handleSearch,
								className: "flex flex-1 items-center gap-2 rounded-full bg-card p-1 shadow-card",
								children: [/* @__PURE__ */ jsx(Input, {
									value: query,
									onChange: (event) => setQuery(event.target.value),
									placeholder: "Pesquisar bairro, rua ou cidade...",
									"aria-label": "Pesquisar lugares no mapa",
									className: "h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
								}), /* @__PURE__ */ jsxs(Button, {
									type: "submit",
									size: "icon",
									disabled: searching,
									className: "h-10 w-10 shrink-0 rounded-full",
									children: [/* @__PURE__ */ jsx(Search, {
										className: "h-4 w-4",
										"aria-hidden": "true"
									}), /* @__PURE__ */ jsx("span", {
										className: "sr-only",
										children: "Pesquisar"
									})]
								})]
							})]
						}),
						!isLoading && !isError && markers.length === 0 ? /* @__PURE__ */ jsx("p", {
							className: "pointer-events-auto rounded-xl bg-card px-3 py-2 text-center text-sm font-semibold shadow-card",
							children: "Ainda não existem denúncias registradas nesta região."
						}) : null,
						isError ? /* @__PURE__ */ jsx("p", {
							role: "alert",
							className: "pointer-events-auto rounded-xl bg-card px-3 py-2 text-center text-sm font-semibold shadow-card",
							children: "Não foi possível carregar os dados. Tente novamente."
						}) : null
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "pointer-events-none absolute inset-x-0 bottom-3 z-[500] flex justify-center",
					children: /* @__PURE__ */ jsxs("span", {
						className: "pointer-events-auto inline-flex items-center gap-2 rounded-full bg-card px-3 py-2 text-xs font-semibold shadow-card",
						children: [
							/* @__PURE__ */ jsx(MapPinned, {
								className: "h-4 w-4 text-leaf-deep",
								"aria-hidden": "true"
							}),
							markers.length,
							" denúncia(s) com localização"
						]
					})
				})
			]
		})
	});
}
//#endregion
export { MapPage as component };
