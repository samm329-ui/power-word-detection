import { Segment, CaptionLine, Word, ProcessingStep } from "./types";

/**
 * Groups word-level segments into caption lines based on words_per_line.
 */
export function groupSegmentsIntoLines(
  segments: Segment[],
  wordsPerLine: number
): CaptionLine[] {
  // Flatten all words from all segments
  const allWords: Word[] = [];
  for (const seg of segments) {
    if (seg.words && seg.words.length > 0) {
      allWords.push(...seg.words);
    }
  }

  if (allWords.length === 0) return [];

  // Group into lines
  const lines: CaptionLine[] = [];
  for (let i = 0; i < allWords.length; i += wordsPerLine) {
    const lineWords = allWords.slice(i, i + wordsPerLine);
    lines.push({
      start: lineWords[0].start,
      end: lineWords[lineWords.length - 1].end,
      words: lineWords,
      text: lineWords.map((w) => w.word).join(" "),
    });
  }

  return lines;
}

/**
 * Formats seconds to SRT-style timestamp (HH:MM:SS.mmm)
 */
export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}

/**
 * Maps a pipeline progress status message to a processing step.
 */
export function mapStatusToStep(
  status: string,
  percent: number
): ProcessingStep {
  const s = status.toLowerCase();
  if (s.includes("completed")) return "completed";
  if (s.includes("failed")) return "failed";
  if (
    s.includes("transcri") ||
    s.includes("chunk") ||
    s.includes("audio") ||
    s.includes("quality") ||
    percent < 70
  )
    return "transcribing";
  if (s.includes("merg") || s.includes("split") || percent < 85)
    return "aligning";
  if (s.includes("align") || s.includes("valid") || percent < 92)
    return "aligning";
  if (s.includes("power") || s.includes("analyz") || percent < 95)
    return "power-analysis";
  if (s.includes("generat") || s.includes("format") || percent < 100)
    return "generating";
  return "transcribing";
}

/**
 * Formats file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
