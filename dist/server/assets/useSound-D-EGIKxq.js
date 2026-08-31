import { createContext, useContext } from "react";
import "react/jsx-runtime";
//#endregion
//#region src/hooks/useSound.tsx
var SoundContext = createContext({
	prefs: {
		ambient: false,
		ui: true,
		volume: .4
	},
	update: () => {},
	play: () => {}
});
function useSound() {
	return useContext(SoundContext);
}
//#endregion
export { useSound as t };
