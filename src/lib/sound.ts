export type SoundPrefs = {
  ambient: boolean;
  ui: boolean;
  volume: number; // 0..1
};

const KEY = "sos-sound-prefs";

export const defaultPrefs: SoundPrefs = { ambient: false, ui: true, volume: 0.4 };

export function loadPrefs(): SoundPrefs {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...defaultPrefs, ...(JSON.parse(raw) as Partial<SoundPrefs>) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

export function savePrefs(prefs: SoundPrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(prefs));
}

let ctx: AudioContext | null = null;
let ambientNodes: { source: AudioBufferSourceNode; gain: GainNode } | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  void ctx.resume();
  return ctx;
}

export type UiSound = "enviado" | "conquista" | "rank" | "compra";

const TONES: Record<UiSound, number[]> = {
  enviado: [523.25, 659.25],
  conquista: [523.25, 659.25, 783.99],
  rank: [440, 587.33, 880],
  compra: [659.25, 523.25],
};

export function playUiSound(sound: UiSound, prefs: SoundPrefs) {
  if (!prefs.ui) return;
  const audio = audioContext();
  if (!audio) return;
  TONES[sound].forEach((freq, index) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = audio.currentTime + index * 0.11;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.01, prefs.volume * 0.25), start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

/** Som ambiente suave gerado (vento/folhas), sem arquivos externos. */
export function startAmbient(prefs: SoundPrefs) {
  const audio = audioContext();
  if (!audio || ambientNodes) return;
  const seconds = 4;
  const buffer = audio.createBuffer(1, audio.sampleRate * seconds, audio.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 800;
  const gain = audio.createGain();
  gain.gain.value = prefs.volume * 0.25;
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start();
  ambientNodes = { source, gain };
}

export function stopAmbient() {
  if (!ambientNodes) return;
  ambientNodes.source.stop();
  ambientNodes.source.disconnect();
  ambientNodes.gain.disconnect();
  ambientNodes = null;
}

export function setAmbientVolume(volume: number) {
  if (ambientNodes) ambientNodes.gain.gain.value = volume * 0.25;
}
