"use client";

import React from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { usePreviewStore } from "@/store/previewStore";

interface PreviewHeaderProps {
  filename: string;
  onBack: () => void;
}

export const PreviewHeader = React.memo(function PreviewHeader({
  filename,
  onBack,
}: PreviewHeaderProps) {
  const currentTemplate = usePreviewStore((s) => s.currentTemplate);

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onBack}
        className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="text-center">
        <p className="text-sm font-medium text-white truncate max-w-[200px]">
          {filename}
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
          <Sparkles className="h-3 w-3 text-power-yellow" />
          {currentTemplate.name}
        </div>
      </div>

      <div className="w-[100px]" />
    </div>
  );
});
