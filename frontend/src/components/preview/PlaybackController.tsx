"use client";

import React, { useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { usePreviewStore } from "@/store/previewStore";

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const PlaybackController = React.memo(function PlaybackController() {
  const isPlaying = usePreviewStore((s) => s.isPlaying);
  const currentTime = usePreviewStore((s) => s.currentTime);
  const totalDuration = usePreviewStore((s) => s.totalDuration);
  const playbackSpeed = usePreviewStore((s) => s.playbackSpeed);
  const togglePlay = usePreviewStore((s) => s.togglePlay);
  const seek = usePreviewStore((s) => s.seek);
  const setSpeed = usePreviewStore((s) => s.setSpeed);
  const reset = usePreviewStore((s) => s.reset);

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      seek((value / 100) * totalDuration);
    },
    [seek, totalDuration]
  );

  return (
    <div className="w-full space-y-3">
      {/* Progress bar */}
      <div className="relative">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={handleSeek}
          className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-power-yellow"
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Reset */}
          <button
            onClick={reset}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex items-center justify-center rounded-full bg-power-yellow text-black w-10 h-10 hover:bg-yellow-400 transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" fill="currentColor" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
            )}
          </button>
        </div>

        {/* Time display */}
        <div className="text-xs font-mono text-zinc-500">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-1">
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              onClick={() => setSpeed(speed)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                playbackSpeed === speed
                  ? "bg-power-yellow text-black"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
