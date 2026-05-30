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

export interface Job {
  id: string;
  status: string;
  progress: number;
  filename: string;
  target_lang: string;
  words_per_line: number;
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
