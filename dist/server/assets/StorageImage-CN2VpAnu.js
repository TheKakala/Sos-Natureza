import { t as supabase } from "./client-C8NJlSke.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
import { ImageOff } from "lucide-react";
//#region src/components/StorageImage.tsx
function StorageImage({ path, alt, className }) {
	const [url, setUrl] = useState(null);
	const [failed, setFailed] = useState(false);
	useEffect(() => {
		let active = true;
		if (!path) {
			setUrl(null);
			return;
		}
		supabase.storage.from("denuncias").createSignedUrl(path, 3600).then(({ data, error }) => {
			if (!active) return;
			if (error || !data) setFailed(true);
			else setUrl(data.signedUrl);
		});
		return () => {
			active = false;
		};
	}, [path]);
	if (!path || failed) return /* @__PURE__ */ jsx("div", {
		className: cn("flex items-center justify-center bg-surface text-muted-foreground", className),
		role: "img",
		"aria-label": `${alt} — imagem indisponível`,
		children: /* @__PURE__ */ jsx(ImageOff, {
			className: "h-6 w-6",
			"aria-hidden": "true"
		})
	});
	if (!url) return /* @__PURE__ */ jsx("div", {
		className: cn("animate-pulse bg-surface", className),
		"aria-hidden": "true"
	});
	return /* @__PURE__ */ jsx("img", {
		src: url,
		alt,
		loading: "lazy",
		className: cn("object-cover", className)
	});
}
//#endregion
export { StorageImage as t };
