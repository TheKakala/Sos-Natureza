import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  defaultPrefs,
  loadPrefs,
  playUiSound,
  savePrefs,
  setAmbientVolume,
  startAmbient,
  stopAmbient,
  type SoundPrefs,
  type UiSound,
} from "@/lib/sound";

type SoundContextValue = {
  prefs: SoundPrefs;
  update: (patch: Partial<SoundPrefs>) => void;
  play: (sound: UiSound) => void;
};

const SoundContext = createContext<SoundContextValue>({
  prefs: defaultPrefs,
  update: () => {},
  play: () => {},
});

export function SoundProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<SoundPrefs>(defaultPrefs);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const update = useCallback((patch: Partial<SoundPrefs>) => {
    setPrefs((previous) => {
      const next = { ...previous, ...patch };
      savePrefs(next);
      if (next.ambient) {
        startAmbient(next);
        setAmbientVolume(next.volume);
      } else {
        stopAmbient();
      }
      return next;
    });
  }, []);

  const play = useCallback((sound: UiSound) => playUiSound(sound, prefs), [prefs]);

  useEffect(() => () => stopAmbient(), []);

  return <SoundContext.Provider value={{ prefs, update, play }}>{children}</SoundContext.Provider>;
}

export function useSound() {
  return useContext(SoundContext);
}
