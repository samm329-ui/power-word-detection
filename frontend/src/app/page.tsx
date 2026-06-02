"use client";

import { useState, useCallback } from "react";
import { UploadScreen } from "@/components/UploadScreen";
import { ProcessingScreen } from "@/components/ProcessingScreen";
import { ResultsScreen } from "@/components/ResultsScreen";
import { Segment, Job, Intensity } from "@/lib/types";

type Screen = "upload" | "processing" | "results";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("upload");
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [wordsPerLine, setWordsPerLine] = useState(3);
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [targetLang, setTargetLang] = useState("en");

  const handleJobCreated = useCallback((createdJob: Job) => {
    setJobId(createdJob.id);
    setJob(createdJob);
    setWordsPerLine(createdJob.words_per_line);
    setScreen("processing");
  }, []);

  const handleProcessingComplete = useCallback(
    (fetchedSegments: Segment[]) => {
      setSegments(fetchedSegments);
      setScreen("results");
    },
    []
  );

  const handleReset = useCallback(() => {
    setScreen("upload");
    setJobId(null);
    setJob(null);
    setSegments([]);
    setWordsPerLine(3);
    setIntensity("medium");
    setTargetLang("en");
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Power Word Detection
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Auto captioning with intelligent power word highlighting
        </p>
      </header>

      {/* Screens */}
      {screen === "upload" && (
        <UploadScreen
          onJobCreated={handleJobCreated}
          wordsPerLine={wordsPerLine}
          onWordsPerLineChange={setWordsPerLine}
          intensity={intensity}
          onIntensityChange={setIntensity}
          targetLang={targetLang}
          onTargetLangChange={setTargetLang}
        />
      )}

      {screen === "processing" && jobId && (
        <ProcessingScreen
          jobId={jobId}
          onComplete={handleProcessingComplete}
          onError={() => setScreen("upload")}
        />
      )}

      {screen === "results" && (
        <ResultsScreen
          segments={segments}
          wordsPerLine={wordsPerLine}
          onWordsPerLineChange={setWordsPerLine}
          filename={job?.filename || ""}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
