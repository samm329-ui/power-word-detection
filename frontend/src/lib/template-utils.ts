import { CSSProperties } from "react";
import {
  CaptionTemplate,
  CaptionLine,
  Word,
} from "./types";

export function getTemplateTextStyles(
  template: CaptionTemplate
): CSSProperties {
  const { typography, colors, effects } = template;

  const style: CSSProperties = {
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight ?? 400,
    color: colors.text ?? "#FFFFFF",
    textTransform: typography.textTransform ?? "none",
    fontStyle: typography.fontStyle ?? "normal",
    lineHeight: typography.lineHeight ?? 1.2,
    letterSpacing: typography.letterSpacing
      ? `${typography.letterSpacing}px`
      : undefined,
  };

  if (effects?.shadow) {
    const s = effects.shadow;
    style.textShadow = `${s.x}px ${s.y}px ${s.blur ?? 0}px ${s.color}`;
  }

  if (effects?.glow) {
    const g = effects.glow;
    const glowColor = g.color;
    const intensity = g.intensity ?? 1;
    const radius = g.radius;
    style.textShadow = `0 0 ${radius * intensity}px ${glowColor}, 0 0 ${radius * 0.5 * intensity}px ${glowColor}`;
  }

  if (effects?.stroke) {
    const st = effects.stroke;
    const strokeWidth = Math.ceil(st.width * 100);
    style.WebkitTextStroke = `${strokeWidth}px ${st.color}`;
  }

  return style;
}

export function getTemplateContainerStyles(
  template: CaptionTemplate
): CSSProperties {
  const { layout, colors, effects } = template;

  const style: CSSProperties = {};

  if (layout?.align) {
    style.textAlign = layout.align;
  }

  if (layout?.borderRadius !== undefined) {
    style.borderRadius = layout.borderRadius;
  }

  if (colors.background && colors.background !== "transparent") {
    style.backgroundColor = colors.background;
  }

  if (layout?.containerPaddingX !== undefined || layout?.containerPaddingY !== undefined) {
    style.padding = `${layout.containerPaddingY ?? 12}px ${layout.containerPaddingX ?? 20}px`;
  }

  if (effects?.backdropBlur !== undefined) {
    style.backdropFilter = `blur(${effects.backdropBlur}px)`;
  }

  return style;
}

export function getWordStyle(
  template: CaptionTemplate,
  word: Word,
  isActive: boolean,
  globalActiveIndex: number | null,
  wordIndex: number
): CSSProperties {
  const { wordBehavior, colors } = template;

  if (!wordBehavior || wordBehavior.mode === "plain") {
    return {};
  }

  const baseColor = colors.text ?? "#FFFFFF";
  const highlightColor =
    wordBehavior.activeWordColor ?? colors.highlight ?? "#FFD700";
  const inactiveOpacity = wordBehavior.inactiveWordOpacity ?? 0.4;

  switch (wordBehavior.mode) {
    case "keywordHighlight":
      return {
        color: word.is_power ? highlightColor : baseColor,
        fontWeight: word.is_power ? 800 : undefined,
      };

    case "currentWord":
      return {
        color: isActive ? highlightColor : baseColor,
        opacity: isActive ? 1 : inactiveOpacity,
      };

    case "bubbleHighlight":
      if (word.is_power) {
        return {
          backgroundColor: wordBehavior.highlightBackground ?? colors.highlight,
          color: wordBehavior.activeWordColor ?? "#FFFFFF",
          borderRadius: 999,
          padding: "2px 8px",
        };
      }
      return {};

    case "blurInactive":
      if (globalActiveIndex !== null) {
        const isCurrentlyActive = wordIndex === globalActiveIndex;
        return {
          opacity: isCurrentlyActive ? 1 : inactiveOpacity,
          filter: isCurrentlyActive ? "none" : `blur(${template.effects?.blur?.amount ?? 2}px)`,
        };
      }
      return {
        opacity: word.is_power ? 1 : inactiveOpacity,
      };

    case "singleWordPunch":
      if (word.is_power) {
        return {
          backgroundColor: wordBehavior.highlightBackground ?? colors.highlight,
          color: wordBehavior.activeWordColor ?? "#FFFFFF",
          padding: "4px 12px",
          borderRadius: 6,
          fontWeight: 800,
        };
      }
      return {};

    case "retroPixel":
      return {
        letterSpacing: "2px",
      };

    case "glass":
      return {
        opacity: isActive ? 1 : 0.7,
      };

    default:
      return {};
  }
}

export function getAnimationProps(
  animation: CaptionTemplate["animation"],
  index: number = 0
) {
  const { entry, durationMs = 200, perWordStaggerMs } = animation;

  const baseTransition = {
    duration: durationMs / 1000,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  };

  const staggerDelay = perWordStaggerMs
    ? (perWordStaggerMs * index) / 1000
    : 0;

  switch (entry) {
    case "fadeIn":
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { ...baseTransition, delay: staggerDelay },
      };

    case "slideUp":
      return {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { ...baseTransition, delay: staggerDelay },
      };

    case "scalePop":
      return {
        initial: { opacity: 0, scale: 0.6 },
        animate: { opacity: 1, scale: 1 },
        transition: {
          type: "spring" as const,
          stiffness: 500,
          damping: 20,
          delay: staggerDelay,
        },
      };

    case "bounce":
      return {
        initial: { opacity: 0, y: -40 },
        animate: { opacity: 1, y: 0 },
        transition: {
          type: "spring" as const,
          stiffness: 400,
          damping: 12,
          delay: staggerDelay,
        },
      };

    case "pulseGlow":
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.3, delay: staggerDelay },
      };

    case "wordReveal":
      return {
        initial: { opacity: 0, filter: "blur(8px)" },
        animate: { opacity: 1, filter: "blur(0px)" },
        transition: { ...baseTransition, delay: staggerDelay },
      };

    case "karaoke":
      return {
        initial: { opacity: 0.3, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.15, delay: staggerDelay },
      };

    case "typeIn":
      return {
        initial: { width: 0, overflow: "hidden" as const },
        animate: { width: "auto", overflow: "visible" as const },
        transition: { ...baseTransition, delay: staggerDelay },
      };

    case "staggeredLineReveal":
      return {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        transition: { ...baseTransition, delay: staggerDelay },
      };

    case "none":
    default:
      return {};
  }
}

export function findActiveCaptionLine(
  lines: CaptionLine[],
  currentTime: number
): number {
  for (let i = 0; i < lines.length; i++) {
    if (currentTime >= lines[i].start && currentTime <= lines[i].end) {
      return i;
    }
  }
  return -1;
}

export function getTotalDuration(lines: CaptionLine[]): number {
  if (lines.length === 0) return 0;
  return Math.max(...lines.map((l) => l.end));
}
