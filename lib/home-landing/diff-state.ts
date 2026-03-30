import { DIFF_FRAMES, TIMING } from "./constants";

export type AnimPhase = "fade-in" | "typing" | "holding" | "fade-out";

export type AnimState = {
  frameIndex: number;
  phase: AnimPhase;
  lineIndex: number;
  charIndex: number;
  phaseElapsed: number;
  fadeProgress: number;
  cursorVisible: boolean;
  cursorBlinkAccum: number;
};

export function createAnimState(): AnimState {
  return {
    frameIndex: 0,
    phase: "fade-in",
    lineIndex: 0,
    charIndex: 0,
    phaseElapsed: 0,
    fadeProgress: 0,
    cursorVisible: true,
    cursorBlinkAccum: 0,
  };
}

export function stepAnimState(prev: AnimState, dtMs: number): AnimState {
  const s = { ...prev };
  s.phaseElapsed += dtMs;

  s.cursorBlinkAccum += dtMs;
  if (s.cursorBlinkAccum >= 530) {
    s.cursorVisible = !s.cursorVisible;
    s.cursorBlinkAccum -= 530;
  }

  const frame = DIFF_FRAMES[s.frameIndex];

  switch (s.phase) {
    case "fade-in": {
      s.fadeProgress = Math.min(1, s.phaseElapsed / TIMING.fadeInMs);
      if (s.fadeProgress >= 1) {
        s.phase = "typing";
        s.phaseElapsed = 0;
        s.fadeProgress = 1;
      }
      break;
    }

    case "typing": {
      const line = frame.lines[s.lineIndex];
      if (!line) {
        s.phase = "holding";
        s.phaseElapsed = 0;
        break;
      }

      if (line.kind === "added") {
        if (s.phaseElapsed >= TIMING.charMs) {
          s.phaseElapsed -= TIMING.charMs;
          s.charIndex++;
          if (s.charIndex >= line.text.length) {
            s.lineIndex++;
            s.charIndex = 0;
            s.phaseElapsed = -TIMING.linePauseMs;
          }
        }
      } else {
        if (s.phaseElapsed >= TIMING.contextAppearMs) {
          s.lineIndex++;
          s.charIndex = 0;
          s.phaseElapsed = 0;
        }
      }
      break;
    }

    case "holding": {
      if (s.phaseElapsed >= TIMING.frameHoldMs) {
        s.phase = "fade-out";
        s.phaseElapsed = 0;
      }
      break;
    }

    case "fade-out": {
      s.fadeProgress = 1 - Math.min(1, s.phaseElapsed / TIMING.fadeOutMs);
      if (s.fadeProgress <= 0) {
        s.frameIndex = (s.frameIndex + 1) % DIFF_FRAMES.length;
        s.phase = "fade-in";
        s.lineIndex = 0;
        s.charIndex = 0;
        s.phaseElapsed = 0;
        s.fadeProgress = 0;
      }
      break;
    }
  }

  return s;
}
