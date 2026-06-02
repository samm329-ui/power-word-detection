"use client";

import React from "react";

interface VerticalPreviewFrameProps {
  children: React.ReactNode;
}

export const VerticalPreviewFrame = React.memo(function VerticalPreviewFrame({
  children,
}: VerticalPreviewFrameProps) {
  return (
    <div className="relative mx-auto flex items-center justify-center">
      <div
        className="relative overflow-hidden rounded-[2rem] bg-black shadow-2xl"
        style={{
          width: "min(360px, 90vw)",
          aspectRatio: "9/16",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-zinc-900" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end p-6">
          {children}
        </div>
      </div>
    </div>
  );
});
