"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaptionLine, CaptionTemplate } from "@/lib/types";
import {
  getTemplateTextStyles,
  getTemplateContainerStyles,
  getWordStyle,
  getAnimationProps,
} from "@/lib/template-utils";

interface CaptionRendererProps {
  captionLine: CaptionLine | null;
  template: CaptionTemplate;
  currentTime: number;
  animationKey: string;
}

export const CaptionRenderer = React.memo(function CaptionRenderer({
  captionLine,
  template,
  currentTime,
  animationKey,
}: CaptionRendererProps) {
  const containerStyle = useMemo(
    () => getTemplateContainerStyles(template),
    [template]
  );

  const textStyle = useMemo(
    () => getTemplateTextStyles(template),
    [template]
  );

  if (!captionLine) return null;

  const isDoubleLine =
    template.wordBehavior?.mode === "doubleLine" && captionLine.words.length > 1;

  if (isDoubleLine) {
    const midPoint = Math.ceil(captionLine.words.length / 2);
    const firstHalf = captionLine.words.slice(0, midPoint);
    const secondHalf = captionLine.words.slice(midPoint);

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          className="w-full text-center"
          style={containerStyle}
          {...getAnimationProps(template.animation)}
        >
          <div
            className="flex flex-col items-center"
            style={{
              gap: template.layout?.lineGap
                ? `${template.layout.lineGap * 10}px`
                : "4px",
            }}
          >
            <div className="flex flex-wrap justify-center gap-x-2">
              {firstHalf.map((word, i) => (
                <motion.span
                  key={`${animationKey}-f-${i}`}
                  className="inline-block"
                  style={{
                    ...textStyle,
                    ...getWordStyle(template, word, false, null, i),
                  }}
                  {...getAnimationProps(
                    template.animation,
                    i * (template.animation.perWordStaggerMs ?? 0)
                  )}
                >
                  {word.word}
                </motion.span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-x-2">
              {secondHalf.map((word, i) => (
                <motion.span
                  key={`${animationKey}-s-${i}`}
                  className="inline-block"
                  style={{
                    ...textStyle,
                    ...getWordStyle(
                      template,
                      word,
                      false,
                      null,
                      i + midPoint
                    ),
                    opacity: 0.6,
                  }}
                  {...getAnimationProps(
                    template.animation,
                    (i + midPoint) *
                      (template.animation.perWordStaggerMs ?? 0)
                  )}
                >
                  {word.word}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (template.wordBehavior?.mode === "stackedLines") {
    const lines: CaptionLine[] = [];
    const chunkSize = captionLine.words.length > 4 ? 3 : 2;
    for (let i = 0; i < captionLine.words.length; i += chunkSize) {
      lines.push({
        ...captionLine,
        words: captionLine.words.slice(i, i + chunkSize),
        text: captionLine.words
          .slice(i, i + chunkSize)
          .map((w) => w.word)
          .join(" "),
      });
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          className="w-full text-center"
          style={containerStyle}
          {...getAnimationProps(template.animation)}
        >
          <div className="flex flex-col items-center gap-1">
            {lines.map((line, lineIndex) => (
              <div
                key={lineIndex}
                className="flex flex-wrap justify-center gap-x-2 rounded-full px-4 py-1"
                style={{
                  backgroundColor:
                    template.colors.background ?? "rgba(0,0,0,0.6)",
                }}
              >
                {line.words.map((word, i) => (
                  <span
                    key={i}
                    className="inline-block"
                    style={textStyle}
                  >
                    {word.word}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const activeWordIndex =
    template.wordBehavior?.mode === "currentWord"
      ? captionLine.words.findIndex(
          (w) => currentTime >= w.start && currentTime <= w.end
        )
      : null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animationKey}
        className="w-full text-center"
        style={containerStyle}
        {...getAnimationProps(template.animation)}
      >
        <div
          className="flex flex-wrap justify-center gap-x-2"
        >
          {captionLine.words.map((word, i) => (
            <motion.span
              key={`${animationKey}-${i}`}
              className="inline-block"
              style={{
                ...textStyle,
                ...getWordStyle(
                  template,
                  word,
                  activeWordIndex === i,
                  activeWordIndex,
                  i
                ),
              }}
              {...getAnimationProps(
                template.animation,
                i * (template.animation.perWordStaggerMs ?? 0)
              )}
            >
              {word.word}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
