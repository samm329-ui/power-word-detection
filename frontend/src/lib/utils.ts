import { Segment, CaptionLine, Word, ProcessingStep } from "./types";

// Fillers to NEVER pick as power words (matches backend)
const FILLERS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "can", "shall", "must",
  "in", "on", "at", "to", "for", "of", "with", "by", "from", "as",
  "into", "about", "between", "through", "after", "before",
  "and", "or", "but", "nor", "so", "yet",
  "i", "you", "he", "she", "it", "we", "they", "me", "him", "her",
  "us", "them", "my", "your", "his", "its", "our", "their",
  "this", "that", "these", "those", "here", "there",
  "not", "no", "very", "just", "also", "too", "only", "even",
  "hai", "hain", "tha", "thi", "ho", "hua", "hue",
  "ka", "ki", "ke", "ko", "se", "me", "pe",
  "aur", "ya", "jo", "wo", "yah", "vah",
  "ek", "iss", "uss", "yeh", "woh",
  "main", "mai", "tu", "tum", "aap", "ye",
  "kya", "kaise", "kyun", "kab", "kaha",
  "bhi", "hi", "toh", "to",
  "isliye", "shayad", "phir",
]);

/**
 * Ensures each display line has at least 1 power word.
 * If a line has 0 power words, promotes the longest non-filler word.
 */
function ensurePowerPerLine(lines: CaptionLine[]): CaptionLine[] {
  return lines.map((line) => {
    // Already has a power word
    if (line.words.some((w) => w.is_power)) return line;

    // Find best candidate (longest non-filler word)
    let bestIdx = -1;
    let bestLen = 0;
    for (let i = 0; i < line.words.length; i++) {
      const wl = line.words[i].word
        .trim()
        .toLowerCase()
        .replace(/[,.\!?;:]$/, "");
      if (!wl || FILLERS.has(wl)) continue;
      if (wl.length > bestLen) {
        bestLen = wl.length;
        bestIdx = i;
      }
    }

    // If all filler, pick longest word
    if (bestIdx === -1 && line.words.length > 0) {
      bestIdx = line.words.reduce(
        (best, w, i) =>
          w.word.trim().length > (line.words[best]?.word.trim().length || 0)
            ? i
            : best,
        0
      );
    }

    if (bestIdx >= 0) {
      const newWords = [...line.words];
      newWords[bestIdx] = { ...newWords[bestIdx], is_power: true };
      return { ...line, words: newWords };
    }

    return line;
  });
}

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

  // Ensure each display line has at least 1 power word
  return ensurePowerPerLine(lines);
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
