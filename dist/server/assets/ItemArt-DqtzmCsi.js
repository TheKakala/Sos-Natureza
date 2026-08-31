import { t as cn } from "./utils-C_uf36nf.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/ItemArt.tsx
var PALETTE = {
	base: "#F7F5E9",
	leaf: "#A8C928",
	deep: "#3E571C",
	dark: "#26321B",
	water: "#4FA3C4",
	gold: "#E4B429",
	bark: "#8A6A3B"
};
function tierOf(price) {
	if (price >= 1500) return 4;
	if (price >= 800) return 3;
	if (price >= 300) return 2;
	if (price >= 150) return 1;
	return 0;
}
function Motif({ motif }) {
	switch (motif) {
		case "sprout": return /* @__PURE__ */ jsxs("g", { children: [
			/* @__PURE__ */ jsx("path", {
				d: "M50 74V48",
				stroke: PALETTE.deep,
				strokeWidth: "4",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M50 54c-12 0-18-7-18-16 10-1 18 5 18 16Z",
				fill: PALETTE.leaf,
				stroke: PALETTE.deep,
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M50 50c11-2 16-9 15-18-10 0-17 7-15 18Z",
				fill: PALETTE.leaf,
				stroke: PALETTE.deep,
				strokeWidth: "2"
			})
		] });
		case "leaf": return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("path", {
			d: "M68 30C46 30 30 44 30 64c0 4 1 7 2 10 16 4 38-8 38-32 0-4 0-8-2-12Z",
			fill: PALETTE.leaf,
			stroke: PALETTE.deep,
			strokeWidth: "2.5"
		}), /* @__PURE__ */ jsx("path", {
			d: "M64 34 34 72",
			stroke: PALETTE.deep,
			strokeWidth: "2.5",
			strokeLinecap: "round"
		})] });
		case "droplets": return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("path", {
			d: "M50 26c12 16 18 25 18 33a18 18 0 1 1-36 0c0-8 6-17 18-33Z",
			fill: PALETTE.water,
			stroke: PALETTE.deep,
			strokeWidth: "2.5"
		}), /* @__PURE__ */ jsx("path", {
			d: "M42 58c0 7 4 11 9 12",
			stroke: PALETTE.base,
			strokeWidth: "3",
			strokeLinecap: "round",
			opacity: ".8"
		})] });
		case "trees": return /* @__PURE__ */ jsxs("g", { children: [
			/* @__PURE__ */ jsx("path", {
				d: "M36 60 50 30l14 30Z",
				fill: PALETTE.leaf,
				stroke: PALETTE.deep,
				strokeWidth: "2.5",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M32 72 50 44l18 28Z",
				fill: PALETTE.leaf,
				stroke: PALETTE.deep,
				strokeWidth: "2.5",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M50 72v10",
				stroke: PALETTE.bark,
				strokeWidth: "5",
				strokeLinecap: "round"
			})
		] });
		case "globe": return /* @__PURE__ */ jsxs("g", { children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "52",
				r: "22",
				fill: PALETTE.water,
				stroke: PALETTE.deep,
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M28 52h44M50 30c8 10 8 34 0 44M50 30c-8 10-8 34 0 44",
				stroke: PALETTE.base,
				strokeWidth: "2",
				fill: "none"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M38 44c6 3 10 1 14 5s10 2 12 8",
				stroke: PALETTE.leaf,
				strokeWidth: "4",
				fill: "none",
				strokeLinecap: "round"
			})
		] });
		case "shield":
		case "shield-check": return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("path", {
			d: "M50 26 72 34v18c0 14-10 22-22 26-12-4-22-12-22-26V34Z",
			fill: PALETTE.leaf,
			stroke: PALETTE.deep,
			strokeWidth: "2.5"
		}), motif === "shield-check" ? /* @__PURE__ */ jsx("path", {
			d: "m40 52 8 8 14-16",
			stroke: PALETTE.base,
			strokeWidth: "5",
			fill: "none",
			strokeLinecap: "round",
			strokeLinejoin: "round"
		}) : /* @__PURE__ */ jsx("path", {
			d: "M50 40c-8 4-10 10-4 16 6-2 8-8 4-16Z",
			fill: PALETTE.base
		})] });
		case "trophy": return /* @__PURE__ */ jsxs("g", { children: [
			/* @__PURE__ */ jsx("path", {
				d: "M36 28h28v14c0 9-6 15-14 15s-14-6-14-15Z",
				fill: PALETTE.gold,
				stroke: PALETTE.deep,
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M36 32h-8c0 9 4 13 9 14M64 32h8c0 9-4 13-9 14",
				stroke: PALETTE.deep,
				strokeWidth: "2.5",
				fill: "none"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M50 57v11M40 76h20",
				stroke: PALETTE.deep,
				strokeWidth: "5",
				strokeLinecap: "round"
			})
		] });
		case "award": return /* @__PURE__ */ jsxs("g", { children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "44",
				r: "16",
				fill: PALETTE.gold,
				stroke: PALETTE.deep,
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "m40 58-4 20 14-8 14 8-4-20",
				fill: PALETTE.leaf,
				stroke: PALETTE.deep,
				strokeWidth: "2.5",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "m50 36 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z",
				fill: PALETTE.base
			})
		] });
		case "crown": return /* @__PURE__ */ jsxs("g", { children: [
			/* @__PURE__ */ jsx("path", {
				d: "M28 66 24 34l14 12 12-18 12 18 14-12-4 32Z",
				fill: PALETTE.gold,
				stroke: PALETTE.deep,
				strokeWidth: "2.5",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M28 72h44",
				stroke: PALETTE.deep,
				strokeWidth: "5",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "56",
				r: "4",
				fill: PALETTE.leaf
			})
		] });
		case "palette": return /* @__PURE__ */ jsxs("g", { children: [
			/* @__PURE__ */ jsx("path", {
				d: "M50 26c14 0 24 10 24 22 0 8-7 9-11 12-3 3 0 8-5 10-13 4-30-8-30-24 0-12 8-20 22-20Z",
				fill: PALETTE.base,
				stroke: PALETTE.deep,
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "41",
				cy: "42",
				r: "4",
				fill: PALETTE.leaf
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "55",
				cy: "38",
				r: "4",
				fill: PALETTE.water
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "62",
				cy: "50",
				r: "4",
				fill: PALETTE.gold
			})
		] });
		case "package":
		case "package-open": return /* @__PURE__ */ jsxs("g", { children: [
			/* @__PURE__ */ jsx("path", {
				d: "M28 44h44v30H28Z",
				fill: PALETTE.bark,
				stroke: PALETTE.deep,
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M28 44 50 32l22 12",
				fill: PALETTE.leaf,
				stroke: PALETTE.deep,
				strokeWidth: "2.5",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M50 32v42",
				stroke: PALETTE.gold,
				strokeWidth: "5"
			})
		] });
		default: return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("path", {
			d: "M28 46h44v28H28Z",
			fill: PALETTE.leaf,
			stroke: PALETTE.deep,
			strokeWidth: "2.5"
		}), /* @__PURE__ */ jsx("path", {
			d: "M50 46v28M28 46l6-12 16 12M72 46l-6-12-16 12",
			stroke: PALETTE.gold,
			strokeWidth: "4",
			fill: "none",
			strokeLinejoin: "round"
		})] });
	}
}
function ItemArt({ motif, price = 0, className, label }) {
	const tier = tierOf(price);
	const ringColor = tier >= 3 ? PALETTE.gold : tier >= 2 ? PALETTE.deep : PALETTE.leaf;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 100",
		className: cn("h-16 w-16", className),
		role: label ? "img" : "presentation",
		"aria-label": label,
		"aria-hidden": label ? void 0 : true,
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("radialGradient", {
				id: `bg-${motif}-${tier}`,
				cx: "50%",
				cy: "35%",
				children: [/* @__PURE__ */ jsx("stop", {
					offset: "0%",
					stopColor: "#FFFFFF"
				}), /* @__PURE__ */ jsx("stop", {
					offset: "100%",
					stopColor: tier >= 3 ? "#EDE7C6" : PALETTE.base
				})]
			}) }),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "50",
				r: "47",
				fill: `url(#bg-${motif}-${tier})`,
				stroke: ringColor,
				strokeWidth: tier >= 2 ? 3 : 2
			}),
			tier >= 1 ? /* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "50",
				r: "41",
				fill: "none",
				stroke: ringColor,
				strokeWidth: "1.5",
				opacity: ".6"
			}) : null,
			tier >= 2 ? /* @__PURE__ */ jsx("g", {
				opacity: ".85",
				children: Array.from({ length: 12 }).map((_, index) => /* @__PURE__ */ jsx("circle", {
					cx: 50 + 44 * Math.cos(index / 12 * Math.PI * 2),
					cy: 50 + 44 * Math.sin(index / 12 * Math.PI * 2),
					r: "2",
					fill: ringColor
				}, index))
			}) : null,
			tier >= 3 ? /* @__PURE__ */ jsx("g", {
				opacity: ".9",
				children: Array.from({ length: 24 }).map((_, index) => {
					const angle = index / 24 * Math.PI * 2;
					return /* @__PURE__ */ jsx("line", {
						x1: 50 + 36 * Math.cos(angle),
						y1: 50 + 36 * Math.sin(angle),
						x2: 50 + 47 * Math.cos(angle),
						y2: 50 + 47 * Math.sin(angle),
						stroke: PALETTE.gold,
						strokeWidth: "1.2",
						opacity: ".55"
					}, index);
				})
			}) : null,
			tier >= 4 ? /* @__PURE__ */ jsxs("g", { children: [
				/* @__PURE__ */ jsx("path", {
					d: "M50 4 53 12 61 9l-4 8 8 3-8 3 4 8-8-3-3 8-3-8-8 3 4-8-8-3 8-3-4-8 8 3Z",
					fill: PALETTE.gold,
					opacity: ".9"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "14",
					cy: "70",
					r: "3",
					fill: PALETTE.gold
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "86",
					cy: "70",
					r: "3",
					fill: PALETTE.gold
				})
			] }) : null,
			/* @__PURE__ */ jsx(Motif, { motif })
		]
	});
}
function toMotif(icon) {
	return [
		"leaf",
		"sprout",
		"droplets",
		"trees",
		"globe",
		"shield",
		"shield-check",
		"trophy",
		"award",
		"crown",
		"palette",
		"package",
		"package-open",
		"gift"
	].includes(icon) ? icon : "leaf";
}
//#endregion
export { toMotif as n, ItemArt as t };
