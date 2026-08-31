import { t as cn } from "./utils-C_uf36nf.js";
import { t as StorageImage } from "./StorageImage-CN2VpAnu.js";
import { n as toMotif, t as ItemArt } from "./ItemArt-DqtzmCsi.js";
import { jsx } from "react/jsx-runtime";
//#region src/components/UserAvatar.tsx
var PRESET_PREFIX = "preset:";
/** Ícones gratuitos disponíveis para qualquer pessoa. */
var FREE_AVATARS = [
	{
		id: "sprout",
		name: "Semente",
		icon: "sprout",
		price: 0
	},
	{
		id: "leaf",
		name: "Folhinha",
		icon: "leaf",
		price: 0
	},
	{
		id: "droplets",
		name: "Gotinha",
		icon: "droplets",
		price: 0
	},
	{
		id: "trees",
		name: "Matinha",
		icon: "trees",
		price: 0
	}
];
function avatarValueFor(icon) {
	return `${PRESET_PREFIX}${icon}`;
}
function UserAvatar({ value, className, alt = "Sua foto de perfil", price = 0 }) {
	if (value?.startsWith("preset:")) return /* @__PURE__ */ jsx(ItemArt, {
		motif: toMotif(value.slice(7)),
		price,
		className: cn("rounded-full", className),
		label: alt
	});
	if (value) return /* @__PURE__ */ jsx(StorageImage, {
		path: value,
		alt,
		className: cn("rounded-full", className)
	});
	return /* @__PURE__ */ jsx(ItemArt, {
		motif: "sprout",
		className: cn("rounded-full", className),
		label: alt
	});
}
//#endregion
export { UserAvatar as n, avatarValueFor as r, FREE_AVATARS as t };
