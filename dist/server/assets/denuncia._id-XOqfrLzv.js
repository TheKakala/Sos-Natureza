import { jsx } from "react/jsx-runtime";
//#region src/routes/_authenticated/denuncia.$id.tsx?tsr-split=errorComponent
var SplitErrorComponent = ({ error }) => /* @__PURE__ */ jsx("div", {
	role: "alert",
	className: "p-6 text-sm",
	children: error.message
});
//#endregion
export { SplitErrorComponent as errorComponent };
