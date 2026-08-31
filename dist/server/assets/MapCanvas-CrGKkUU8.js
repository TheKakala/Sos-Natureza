import { ClientOnly } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Loader2 } from "lucide-react";
//#region src/components/MapCanvas.tsx
function MapSkeleton() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex h-full w-full items-center justify-center bg-surface",
		children: /* @__PURE__ */ jsxs("span", {
			className: "flex items-center gap-2 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ jsx(Loader2, {
				className: "h-4 w-4 animate-spin",
				"aria-hidden": "true"
			}), " Carregando mapa..."]
		})
	});
}
function MapCanvas(props) {
	return /* @__PURE__ */ jsx(ClientOnly, { fallback: /* @__PURE__ */ jsx(MapSkeleton, {}) });
}
//#endregion
export { MapCanvas as t };
