"use client";

import { useState, useMemo } from "react";
import { RotateCcw, ChevronDown, ChevronUp, FileAudio, Play } from "lucide-react";
import { Segment } from "@/lib/types";
import { groupSegmentsIntoLines, formatTimestamp } from "@/lib/utils";

interface ResultsScreenProps {
  segments: Segment[];
  wordsPerLine: number;
  onWordsPerLineChange: (value: number) => void;
  filename: string;
  onReset: () => void;
  onOpenPreview: () => void;
}

export function ResultsScreen({
  segments,
  wordsPerLine,
  onWordsPerLineChange,
  filename,
  onReset,
  onOpenPreview,
}: ResultsScreenProps) {
  const [showAll, setShowAll] = useState(false);

  const captionLines = useMemo(
    () => groupSegmentsIntoLines(segments, wordsPerLine),
    [segments, wordsPerLine]
  );

  const displayLines = showAll ? captionLines : captionLines.slice(0, 30);
  const totalWords = segments.reduce(
    (sum, seg) => sum + (seg.words?.length || 0),
    0
  );
  const powerWords = segments.reduce(
    (sum, seg) =>
      sum + (seg.words?.filter((w) => w.is_power).length || 0),
    0
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileAudio className="h-5 w-5 text-power-yellow" />
          <div>
            <p className="font-medium text-white">{filename}</p>
            <p className="text-xs text-zinc-500">
              {totalWords} words &middot; {powerWords} power words &middot;{" "}
              {captionLines.length} lines
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPreview}
            className="flex items-center gap-2 rounded-lg bg-power-yellow px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-400"
          >
            <Play className="h-4 w-4" fill="currentColor" />
            Preview & Animate
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            New File
          </button>
        </div>
      </div>

      {/* Words per Line Control */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <label className="mb-3 block text-sm font-medium text-zinc-300">
          Words per Line
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={8}
            value={wordsPerLine}
            onChange={(e) => onWordsPerLineChange(Number(e.target.value))}
            className="flex-1 accent-power-yellow"
          />
          <span className="w-10 text-center text-2xl font-bold text-power-yellow">
            {wordsPerLine}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-white">{captionLines.length}</p>
          <p className="text-xs text-zinc-500">Caption Lines</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-power-yellow">{powerWords}</p>
          <p className="text-xs text-zinc-500">Power Words</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-white">{totalWords}</p>
          <p className="text-xs text-zinc-500">Total Words</p>
        </div>
      </div>

      {/* Caption Lines */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-zinc-300">Captions</h2>
        <div className="space-y-1">
          {displayLines.map((line, i) => (
            <div
              key={i}
              className="group flex items-start gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-zinc-900/50"
            >
              {/* Timestamp */}
              <div className="w-36 flex-shrink-0 pt-0.5">
                <span className="font-mono text-xs text-zinc-500">
                  {formatTimestamp(line.start)}
                </span>
                <span className="mx-1 text-zinc-600">&rarr;</span>
                <span className="font-mono text-xs text-zinc-500">
                  {formatTimestamp(line.end)}
                </span>
              </div>

              {/* Words */}
              <div className="flex flex-wrap gap-1.5">
                {line.words.map((word, wi) => (
                  <span
                    key={wi}
                    className={`text-lg leading-relaxed ${
                      word.is_power ? "power-word" : "text-zinc-200"
                    }`}
                  >
                    {word.word}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less */}
        {captionLines.length > 30 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 py-3 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show All ({captionLines.length} lines)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
