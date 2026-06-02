"use client";

import React, { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { usePreviewStore } from "@/store/previewStore";
import { templates } from "@/lib/templates";
import { getTemplateTextStyles } from "@/lib/template-utils";
import { TemplateCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  neon: "Neon",
  bold: "Bold",
  minimal: "Minimal",
  cinematic: "Cinematic",
  viral: "Viral",
  creator: "Creator",
  retro: "Retro",
  glass: "Glass",
};

const CATEGORY_ORDER: TemplateCategory[] = [
  "viral",
  "bold",
  "neon",
  "minimal",
  "cinematic",
  "creator",
  "retro",
  "glass",
];

export const TemplateGallery = React.memo(function TemplateGallery() {
  const currentTemplateId = usePreviewStore((s) => s.currentTemplateId);
  const setTemplate = usePreviewStore((s) => s.setTemplate);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");

  const templateStyles = useMemo(
    () =>
      templates.map((t) => ({
        id: t.id,
        style: getTemplateTextStyles(t),
      })),
    []
  );

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") return templates;
    return templates.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Templates
      </h3>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-power-yellow text-black"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          All
        </button>
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-power-yellow text-black"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
        {filteredTemplates.map((template) => {
          const isActive = currentTemplateId === template.id;
          const ts = templateStyles.find((s) => s.id === template.id);

          return (
            <button
              key={template.id}
              onClick={() => setTemplate(template.id)}
              className={`group relative rounded-xl border p-3 text-left transition-all duration-200 ${
                isActive
                  ? "border-power-yellow bg-zinc-800/80"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50"
              }`}
            >
              {isActive && (
                <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-power-yellow text-black">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
              )}

              <div className="mb-2 truncate text-xs font-medium text-zinc-300">
                {template.name}
              </div>

              <div
                className="truncate text-sm"
                style={{
                  ...(ts?.style ?? {}),
                  fontSize: "13px",
                  lineHeight: 1.3,
                }}
              >
                Preview text
              </div>

              {template.colors.highlight && (
                <div className="mt-1.5 flex gap-1">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: template.colors.text ?? "#FFF" }}
                  />
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: template.colors.highlight,
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
