"use client";

import { useCallback, useRef } from "react";

export function useSignalSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new AC();
    }
    return ctxRef.current!;
  };

  const tone = useCallback(
    (freq: number, start: number, dur: number, type: OscillatorType, peak: number, ctx: AudioContext) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    },
    []
  );

  const playScan = useCallback(() => {
    try {
      const ctx = getCtx();
      tone(880, 0, 0.08, "sine", 0.05, ctx);
      tone(1046, 0.09, 0.08, "sine", 0.05, ctx);
    } catch {}
  }, [tone]);

  const playResult = useCallback(
    (risk: "danger" | "caution" | "clear") => {
      try {
        const ctx = getCtx();
        if (risk === "danger") {
          tone(392, 0, 0.14, "sawtooth", 0.07, ctx);
          tone(311, 0.16, 0.14, "sawtooth", 0.07, ctx);
          tone(392, 0.32, 0.16, "sawtooth", 0.08, ctx);
        } else if (risk === "caution") {
          tone(660, 0, 0.12, "triangle", 0.06, ctx);
          tone(660, 0.18, 0.12, "triangle", 0.06, ctx);
        } else {
          tone(523, 0, 0.1, "sine", 0.05, ctx);
          tone(784, 0.1, 0.16, "sine", 0.06, ctx);
        }
      } catch {}
    },
    [tone]
  );

  return { playScan, playResult };
}
