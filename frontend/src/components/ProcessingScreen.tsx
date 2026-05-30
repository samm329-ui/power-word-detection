"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Mic,
  AlignHorizontalDistributeCenter,
  Sparkles,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { createWebSocket, getSegments, getJob } from "@/lib/api";
import { Segment, ProcessingStep } from "@/lib/types";
import { mapStatusToStep } from "@/lib/utils";

interface ProcessingScreenProps {
  jobId: string;
  onComplete: (segments: Segment[]) => void;
  onError: () => void;
}

const STEPS: {
  key: ProcessingStep;
  label: string;
  icon: typeof Mic;
  description: string;
}[] = [
  {
    key: "transcribing",
    label: "Transcribing",
    icon: Mic,
    description: "Converting speech to text with Whisper",
  },
  {
    key: "aligning",
    label: "Word Alignment",
    icon: AlignHorizontalDistributeCenter,
    description: "Aligning words with audio timestamps",
  },
  {
    key: "power-analysis",
    label: "Power Word Analysis",
    icon: Sparkles,
    description: "Identifying power words with AI",
  },
  {
    key: "generating",
    label: "Generating Lines",
    icon: FileText,
    description: "Building caption output",
  },
];

export function ProcessingScreen({
  jobId,
  onComplete,
  onError,
}: ProcessingScreenProps) {
  const [percent, setPercent] = useState(0);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("transcribing");
  const [statusDetail, setStatusDetail] = useState("Initializing...");
  const [completedSteps, setCompletedSteps] = useState<Set<ProcessingStep>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const ws = createWebSocket(jobId);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "progress") {
          const p = data.percent as number;
          const status = data.status as string;
          const details = data.details as string;

          setPercent(p);
          if (details) setStatusDetail(details);

          const step = mapStatusToStep(status, p);
          setCurrentStep(step);

          // Mark previous steps as completed
          const stepOrder: ProcessingStep[] = [
            "transcribing",
            "aligning",
            "power-analysis",
            "generating",
          ];
          const currentIdx = stepOrder.indexOf(step);
          setCompletedSteps((prev) => {
            const next = new Set<ProcessingStep>(prev);
            for (let i = 0; i < currentIdx; i++) {
              next.add(stepOrder[i]);
            }
            return next;
          });

          // If completed, fetch segments
          if (step === "completed" || p >= 100) {
            setCompletedSteps(
              new Set<ProcessingStep>(["transcribing", "aligning", "power-analysis", "generating"])
            );
            fetchSegments();
          }
        }
      } catch {
        // Ignore parse errors
      }
    };

    ws.onerror = () => {
      startPolling();
    };

    ws.onclose = () => {
      startPolling();
    };

    return () => {
      ws.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [jobId]);

  const startPolling = useCallback(() => {
    if (pollRef.current) return; // Already polling
    pollRef.current = setInterval(async () => {
      try {
        const job = await getJob(jobId);
        setPercent(job.progress);

        if (job.status === "completed") {
          if (pollRef.current) clearInterval(pollRef.current);
          fetchSegments();
        } else if (job.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          setError(job.error || "Processing failed. Please try again.");
        }
      } catch {
        // Ignore polling errors
      }
    }, 2000);
  }, [jobId]);

  const fetchSegments = async () => {
    try {
      const segs = await getSegments(jobId);
      if (segs && segs.length > 0) {
        onComplete(segs);
      } else {
        setError("No caption data found. Please try again.");
      }
    } catch {
      setError("Failed to load results. Please try again.");
    }
  };

  const stepIdx = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-300">Processing</span>
          <span className="font-mono text-power-yellow">{percent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="progress-fill h-full rounded-full bg-gradient-to-r from-power-yellow-dim to-power-yellow"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-center text-sm text-zinc-500">{statusDetail}</p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.has(step.key);
          const isCurrent = step.key === currentStep;
          const isPending = !isCompleted && !isCurrent;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-4 rounded-xl p-4 transition-all ${
                isCurrent
                  ? "border border-power-yellow/30 bg-power-yellow/5"
                  : isCompleted
                    ? "border border-zinc-800 bg-zinc-900/50"
                    : "border border-zinc-800/50 bg-zinc-900/20 opacity-50"
              }`}
            >
              {/* Icon */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  isCompleted
                    ? "bg-green-900/50 text-green-400"
                    : isCurrent
                      ? "bg-power-yellow/10 text-power-yellow"
                      : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    isCompleted
                      ? "text-green-400"
                      : isCurrent
                        ? "text-white"
                        : "text-zinc-500"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-zinc-500">{step.description}</p>
              </div>

              {/* Status badge */}
              {isCompleted && (
                <span className="rounded-full bg-green-900/50 px-2 py-1 text-xs text-green-400">
                  Done
                </span>
              )}
              {isCurrent && (
                <span className="rounded-full bg-power-yellow/10 px-2 py-1 text-xs text-power-yellow">
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="space-y-4 rounded-xl border border-red-800 bg-red-900/20 p-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
          <button
            onClick={onError}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}
