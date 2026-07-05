const STORAGE_KEY = "km-graph-sound";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  return ctx;
}

export function isSoundEnabled(): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) !== "off";
}

export function setSoundEnabled(on: boolean) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
}

function tone(freq: number, start: number, duration: number, gain = 0.08) {
  const audio = getCtx();
  if (!audio || !isSoundEnabled()) return;
  if (audio.state === "suspended") void audio.resume();

  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, start);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export function playAppleOpen() {
  const audio = getCtx();
  if (!audio) return;
  const t = audio.currentTime;
  tone(660, t, 0.18, 0.07);
  tone(880, t + 0.08, 0.22, 0.06);
}

export function playBranchTap() {
  const audio = getCtx();
  if (!audio) return;
  tone(520, audio.currentTime, 0.1, 0.04);
}

export function playLetterClose() {
  const audio = getCtx();
  if (!audio) return;
  tone(440, audio.currentTime, 0.12, 0.05);
}
