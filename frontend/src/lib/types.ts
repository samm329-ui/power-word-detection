export interface Word {
  word: string;
  start: number;
  end: number;
  score?: number;
  is_power?: boolean;
}

export interface Segment {
  text: string;
  start: number;
  end: number;
  words: Word[];
}

export interface CaptionLine {
  start: number;
  end: number;
  words: Word[];
  text: string;
}

export type Intensity = "light" | "medium" | "aggressive";

export interface Job {
  id: string;
  status: string;
  progress: number;
  filename: string;
  target_lang: string;
  words_per_line: number;
  intensity: Intensity;
  error?: string | null;
  created_at: string;
  completed_at?: string | null;
}

export type ProcessingStep =
  | "idle"
  | "transcribing"
  | "aligning"
  | "power-analysis"
  | "generating"
  | "completed"
  | "failed";

// Caption Template Types
export type AnimationEntry =
  | "none"
  | "fadeIn"
  | "slideUp"
  | "scalePop"
  | "bounce"
  | "pulseGlow"
  | "wordReveal"
  | "karaoke"
  | "typeIn"
  | "staggeredLineReveal";

export type WordBehaviorMode =
  | "plain"
  | "keywordHighlight"
  | "currentWord"
  | "bubbleHighlight"
  | "blurInactive"
  | "splitBlocks"
  | "doubleLine"
  | "singleWordPunch"
  | "retroPixel"
  | "glass"
  | "stackedLines";

export type TemplateCategory =
  | "neon"
  | "bold"
  | "minimal"
  | "cinematic"
  | "viral"
  | "creator"
  | "retro"
  | "glass";

export interface CaptionTemplate {
  id: string;
  name: string;
  category: TemplateCategory;

  typography: {
    fontFamily: string;
    fontWeight?: number | string;
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    textTransform?: "none" | "uppercase" | "lowercase";
    fontStyle?: "normal" | "italic";
  };

  layout?: {
    align?: "left" | "center" | "right";
    containerPaddingX?: number;
    containerPaddingY?: number;
    borderRadius?: number;
    maxWidth?: string;
    lineGap?: number;
  };

  colors: {
    text?: string;
    background?: string;
    highlight?: string;
    secondary?: string;
    muted?: string;
    glow?: string;
  };

  effects?: {
    shadow?: {
      x: number;
      y: number;
      blur?: number;
      color: string;
    };
    glow?: {
      radius: number;
      color: string;
      intensity?: number;
    };
    stroke?: {
      width: number;
      color: string;
    };
    blur?: {
      amount: number;
      activeWordOnly?: boolean;
    };
    backdropBlur?: number;
  };

  wordBehavior?: {
    mode: WordBehaviorMode;
    activeWordColor?: string;
    inactiveWordOpacity?: number;
    highlightBackground?: string;
  };

  animation: {
    entry: AnimationEntry;
    easing?: string;
    durationMs?: number;
    perWordStaggerMs?: number;
  };
}
