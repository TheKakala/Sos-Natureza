import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/EmptyState.tsx
function EmptyState({ icon: Icon, title, description, action }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "surface-card flex flex-col items-center gap-3 px-6 py-10 text-center",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-leaf-deep",
				children: /* @__PURE__ */ jsx(Icon, {
					className: "h-7 w-7",
					"aria-hidden": "true"
				})
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "text-base font-semibold",
				children: title
			}),
			description ? /* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted-foreground",
				children: description
			}) : null,
			action
		]
	});
}
//#endregion
export { EmptyState as t };
