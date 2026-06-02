"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { Segment } from "@/lib/types";
import { usePreviewStore } from "@/store/previewStore";
import { findActiveCaptionLine } from "@/lib/template-utils";
import { VerticalPreviewFrame } from "./preview/VerticalPreviewFrame";
import { CaptionRenderer } from "./preview/CaptionRenderer";
import { TemplateGallery } from "./preview/TemplateGallery";
import { PlaybackController } from "./preview/PlaybackController";
import { PreviewHeader } from "./preview/PreviewHeader";

interface VerticalPreviewPageProps {
  segments: Segment[];
  wordsPerLine: number;
  filename: string;
  onBack: () => void;
}

export function VerticalPreviewPage({
  segments,
  wordsPerLine,
  filename,
  onBack,
}: VerticalPreviewPageProps) {
  const setSegments = usePreviewStore((s) => s.setSegments);
  const currentTime = usePreviewStore((s) => s.currentTime);
  const currentTemplate = usePreviewStore((s) => s.currentTemplate);
  const captionLines = usePreviewStore((s) => s.captionLines);
  const isPlaying = usePreviewStore((s) => s.isPlaying);
  const tick = usePreviewStore((s) => s.tick);

  const lastFrameTime = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    setSegments(segments, wordsPerLine);
  }, [segments, wordsPerLine, setSegments]);

  const activeLineIndex = useMemo(
    () => findActiveCaptionLine(captionLines, currentTime),
    [captionLines, currentTime]
  );

  const activeLine =
    activeLineIndex >= 0 ? captionLines[activeLineIndex] : null;

  const animationKey = useMemo(() => {
    if (!activeLine) return "empty";
    return `${activeLine.start}-${activeLine.end}-${currentTemplate.id}`;
  }, [activeLine, currentTemplate.id]);

  const animate = useCallback(
    (timestamp: number) => {
      if (lastFrameTime.current === 0) {
        lastFrameTime.current = timestamp;
      }

      const deltaTime = (timestamp - lastFrameTime.current) / 1000;
      lastFrameTime.current = timestamp;

      if (deltaTime > 0 && deltaTime < 0.1) {
        tick(deltaTime);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [tick]
  );

  useEffect(() => {
    if (isPlaying) {
      lastFrameTime.current = 0;
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, animate]);

  return (
    <div className="space-y-6">
      <PreviewHeader filename={filename} onBack={onBack} />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Preview Area */}
        <div className="flex-1 flex flex-col gap-4">
          <VerticalPreviewFrame>
            <CaptionRenderer
              captionLine={activeLine}
              template={currentTemplate}
              currentTime={currentTime}
              animationKey={animationKey}
            />
          </VerticalPreviewFrame>

          <div className="max-w-[360px] mx-auto w-full">
            <PlaybackController />
          </div>
        </div>

        {/* Template Gallery Sidebar */}
        <div className="w-full lg:w-72 lg:sticky lg:top-4">
          <TemplateGallery />
        </div>
      </div>
    </div>
  );
}
