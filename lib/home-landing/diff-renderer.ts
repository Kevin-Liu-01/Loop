import {
  DIFF_FRAMES,
  LANDING_PALETTE,
  FONT_CSS,
  FONT_CSS_BOLD,
  FONT_CSS_HEADER,
  FONT_MONO,
  FONT_SIZE,
  LINE_HEIGHT,
  PANEL,
} from "./constants";
import type { AnimState } from "./diff-state";

export function computePanelHeight(lineCount: number): number {
  return PANEL.headerHeight + PANEL.paddingY + lineCount * LINE_HEIGHT + PANEL.paddingY;
}

export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawPanelChrome(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  filename: string
): void {
  drawRoundRect(ctx, 0, 0, w, h, PANEL.radius);
  ctx.fillStyle = LANDING_PALETTE.surface;
  ctx.fill();
  ctx.strokeStyle = LANDING_PALETTE.surfaceBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  const r = PANEL.radius;
  const hh = PANEL.headerHeight;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.arcTo(w, 0, w, r, r);
  ctx.lineTo(w, hh);
  ctx.lineTo(0, hh);
  ctx.lineTo(0, r);
  ctx.arcTo(0, 0, r, 0, r);
  ctx.closePath();
  ctx.fillStyle = LANDING_PALETTE.surfaceHeader;
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(0, hh - 0.5);
  ctx.lineTo(w, hh - 0.5);
  ctx.strokeStyle = LANDING_PALETTE.surfaceBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  const dotY = hh / 2;
  const dotR = 4;
  const dotX0 = PANEL.paddingX;
  ctx.fillStyle = "#2a2a2e";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(dotX0 + i * 14, dotY, dotR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = FONT_CSS_HEADER;
  ctx.fillStyle = LANDING_PALETTE.textMuted;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(filename, dotX0 + 3 * 14 + 10, dotY);
}

function drawTopGlow(ctx: CanvasRenderingContext2D, w: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, 60);
  grad.addColorStop(0, "rgba(232, 101, 10, 0.05)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.save();
  drawRoundRect(ctx, 0, 0, w, 60, PANEL.radius);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

function lineColor(kind: string): string {
  if (kind === "added") return LANDING_PALETTE.added;
  if (kind === "removed") return LANDING_PALETTE.removed;
  if (kind === "header") return LANDING_PALETTE.textMuted;
  return LANDING_PALETTE.text;
}

function lineBg(kind: string): string | null {
  if (kind === "added") return LANDING_PALETTE.addedBg;
  if (kind === "removed") return LANDING_PALETTE.removedBg;
  return null;
}

function renderTypingChars(
  ctx: CanvasRenderingContext2D,
  text: string,
  charIndex: number,
  x: number,
  y: number,
  charWidth: number,
  color: string,
  alpha: number
): void {
  const WAVE = 3;
  for (let c = 0; c < charIndex; c++) {
    const fromEnd = charIndex - 1 - c;
    const opacity =
      fromEnd < WAVE
        ? 0.4 + (fromEnd / Math.max(WAVE - 1, 1)) * 0.6
        : 1;
    ctx.globalAlpha = alpha * opacity;
    ctx.fillStyle = color;
    ctx.fillText(text[c], x + c * charWidth, y);
  }
  ctx.globalAlpha = alpha;
}

export function renderDiffPanel(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: AnimState,
  charWidth: number
): void {
  const frame = DIFF_FRAMES[state.frameIndex];
  const alpha =
    state.phase === "fade-in" || state.phase === "fade-out"
      ? state.fadeProgress
      : 1;

  ctx.clearRect(0, 0, w, h);
  ctx.globalAlpha = alpha;

  drawPanelChrome(ctx, w, h, frame.filename);
  drawTopGlow(ctx, w);

  if (state.phase === "fade-in") {
    ctx.globalAlpha = 1;
    return;
  }

  const contentY = PANEL.headerHeight + PANEL.paddingY;
  const textX =
    PANEL.paddingX + PANEL.lineNumWidth + PANEL.markerWidth + PANEL.gap;
  let lineNum = 1;

  for (let i = 0; i < frame.lines.length; i++) {
    const line = frame.lines[i];

    if (state.phase === "typing" && i > state.lineIndex) continue;

    const y = contentY + i * LINE_HEIGHT;
    const baselineY = y + LINE_HEIGHT * 0.58;

    const bg = lineBg(line.kind);
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(
        PANEL.paddingX - 4,
        y,
        w - PANEL.paddingX * 2 + 8,
        LINE_HEIGHT
      );
    }

    if (line.kind !== "blank" && line.kind !== "header") {
      ctx.font = `${FONT_SIZE - 1}px ${FONT_MONO}`;
      ctx.fillStyle = LANDING_PALETTE.lineNum;
      ctx.textAlign = "right";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(
        `${lineNum}`,
        PANEL.paddingX + PANEL.lineNumWidth - 4,
        baselineY
      );
      lineNum++;
    }

    ctx.textAlign = "left";

    if (line.kind === "added" || line.kind === "removed") {
      ctx.font = FONT_CSS_BOLD;
      ctx.fillStyle = lineColor(line.kind);
      ctx.fillText(
        line.kind === "added" ? "+" : "\u2212",
        PANEL.paddingX + PANEL.lineNumWidth + 2,
        baselineY
      );
    }

    if (line.kind === "blank") continue;

    const isTyping =
      state.phase === "typing" &&
      i === state.lineIndex &&
      line.kind === "added";

    if (line.kind === "header") {
      ctx.font = FONT_CSS_BOLD;
      ctx.fillStyle = LANDING_PALETTE.textMuted;
      ctx.fillText(line.text, PANEL.paddingX, baselineY);
    } else if (isTyping) {
      ctx.font = FONT_CSS;
      renderTypingChars(
        ctx,
        line.text,
        state.charIndex,
        textX,
        baselineY,
        charWidth,
        lineColor(line.kind),
        alpha
      );

      if (state.cursorVisible) {
        const cx = textX + state.charIndex * charWidth;
        ctx.fillStyle = LANDING_PALETTE.cursor;
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillRect(cx, y + 4, 1.5, LINE_HEIGHT - 8);
        ctx.globalAlpha = alpha;
      }
    } else {
      ctx.font = FONT_CSS;
      ctx.fillStyle = lineColor(line.kind);
      ctx.fillText(line.text, textX, baselineY);
    }
  }

  ctx.globalAlpha = 1;
}
