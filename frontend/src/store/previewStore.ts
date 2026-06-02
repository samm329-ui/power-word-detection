import { create } from "zustand";
import { Segment, CaptionLine, CaptionTemplate } from "@/lib/types";
import { templates, DEFAULT_TEMPLATE_ID } from "@/lib/templates";
import { groupSegmentsIntoLines } from "@/lib/utils";

interface PreviewState {
  segments: Segment[];
  captionLines: CaptionLine[];
  wordsPerLine: number;

  currentTemplateId: string;
  currentTemplate: CaptionTemplate;

  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  totalDuration: number;

  setSegments: (segments: Segment[], wordsPerLine: number) => void;
  setWordsPerLine: (wpl: number) => void;
  setTemplate: (templateId: string) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setSpeed: (speed: number) => void;
  tick: (deltaTime: number) => void;
  reset: () => void;
}

export const usePreviewStore = create<PreviewState>((set, get) => ({
  segments: [],
  captionLines: [],
  wordsPerLine: 3,

  currentTemplateId: DEFAULT_TEMPLATE_ID,
  currentTemplate: templates.find((t) => t.id === DEFAULT_TEMPLATE_ID)!,

  isPlaying: false,
  currentTime: 0,
  playbackSpeed: 1,
  totalDuration: 0,

  setSegments: (segments, wordsPerLine) => {
    const captionLines = groupSegmentsIntoLines(segments, wordsPerLine);
    const totalDuration =
      captionLines.length > 0
        ? Math.max(...captionLines.map((l) => l.end))
        : 0;
    set({ segments, captionLines, wordsPerLine, totalDuration });
  },

  setWordsPerLine: (wpl) => {
    const { segments } = get();
    if (segments.length === 0) return;
    const captionLines = groupSegmentsIntoLines(segments, wpl);
    const totalDuration =
      captionLines.length > 0
        ? Math.max(...captionLines.map((l) => l.end))
        : 0;
    set({ wordsPerLine: wpl, captionLines, totalDuration });
  },

  setTemplate: (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      set({ currentTemplateId: templateId, currentTemplate: template });
    }
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  seek: (time) => {
    const { totalDuration } = get();
    set({ currentTime: Math.max(0, Math.min(time, totalDuration)) });
  },

  setSpeed: (speed) => set({ playbackSpeed: speed }),

  tick: (deltaTime) => {
    const { isPlaying, currentTime, playbackSpeed, totalDuration } = get();
    if (!isPlaying) return;

    const newTime = currentTime + deltaTime * playbackSpeed;
    if (newTime >= totalDuration) {
      set({ currentTime: 0, isPlaying: false });
    } else {
      set({ currentTime: newTime });
    }
  },

  reset: () =>
    set({
      currentTime: 0,
      isPlaying: false,
    }),
}));
