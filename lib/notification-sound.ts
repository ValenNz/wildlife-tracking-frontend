"use client";

const SOUND_MUTED_KEY = "wildlife-notif-sound-muted";

let sharedAudioContext: AudioContext | null = null;
let unlockAttached = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioCtx) return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioCtx();
  }

  return sharedAudioContext;
}

export function initNotificationAudioUnlock(): void {
  if (typeof window === "undefined" || unlockAttached) return;
  unlockAttached = true;

  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      void ctx.resume().catch(() => {});
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
}

export function isNotificationSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SOUND_MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setNotificationSoundMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SOUND_MUTED_KEY, muted ? "1" : "0");
  } catch {
  }
}

function scheduleTone(
  ctx: AudioContext,
  startOffsetSec: number,
  durationSec: number,
  frequencyHz: number,
  volume: number,
  type: OscillatorType = "sine",
) {
  const startTime = ctx.currentTime + startOffsetSec;
  const endTime = startTime + durationSec;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequencyHz, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.012);
  gain.gain.setValueAtTime(volume, Math.max(startTime + 0.015, endTime - 0.025));
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(endTime + 0.01);
}

export function playCriticalAlarm(): void {
  if (isNotificationSoundMuted()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const play = () => {
    scheduleTone(ctx, 0.0, 0.24, 920, 0.16, "triangle");
    scheduleTone(ctx, 0.0, 0.24, 1380, 0.06, "sine");

    scheduleTone(ctx, 0.35, 0.17, 920, 0.16, "triangle");
    scheduleTone(ctx, 0.35, 0.17, 1380, 0.06, "sine");

    scheduleTone(ctx, 0.74, 0.24, 960, 0.16, "triangle");
    scheduleTone(ctx, 0.74, 0.24, 1440, 0.06, "sine");

    scheduleTone(ctx, 1.09, 0.17, 960, 0.16, "triangle");
    scheduleTone(ctx, 1.09, 0.17, 1440, 0.06, "sine");
  };

  if (ctx.state === "suspended") {
    void ctx.resume().then(play).catch(() => {});
  } else {
    play();
  }

  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate([220, 100, 160, 200, 220, 100, 160]);
    } catch {
    }
  }
}

export function playNotificationChime(): void {
  if (isNotificationSoundMuted()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const play = () => {
    scheduleTone(ctx, 0.0, 0.11, 660, 0.08, "sine");
    scheduleTone(ctx, 0.12, 0.16, 880, 0.07, "sine");
  };

  if (ctx.state === "suspended") {
    void ctx.resume().then(play).catch(() => {});
  } else {
    play();
  }
}
