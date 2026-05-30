"use client";

import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { Upload, FileAudio, Loader2 } from "lucide-react";
import { createJob } from "@/lib/api";
import { Job } from "@/lib/types";
import { formatFileSize } from "@/lib/utils";

interface UploadScreenProps {
  onJobCreated: (job: Job) => void;
  wordsPerLine: number;
  onWordsPerLineChange: (value: number) => void;
}

export function UploadScreen({
  onJobCreated,
  wordsPerLine,
  onWordsPerLineChange,
}: UploadScreenProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES = [
    "audio/mpeg",
    "audio/wav",
    "audio/mp3",
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ];
  const ACCEPTED_EXTENSIONS = ".mp3,.wav,.mp4,.mov,.webm";

  const handleFile = useCallback((f: File) => {
    setError(null);
    const ext = f.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["mp3", "wav", "mp4", "mov", "webm"];

    if (!validExtensions.includes(ext || "")) {
      setError("Unsupported file type. Please upload MP3, WAV, MP4, MOV, or WebM.");
      return;
    }

    if (f.size > 500 * 1024 * 1024) {
      setError("File too large. Maximum size is 500 MB.");
      return;
    }

    setFile(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const job = await createJob(file, wordsPerLine);
      onJobCreated(job);
    } catch (err: unknown) {
      let message = "Failed to upload file";
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        message = err.response.data.detail;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
          isDragging
            ? "border-power-yellow bg-power-yellow/5"
            : file
              ? "border-zinc-600 bg-zinc-900/50"
              : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="hidden"
        />

        {file ? (
          <div className="space-y-3">
            <FileAudio className="mx-auto h-12 w-12 text-power-yellow" />
            <div>
              <p className="font-medium text-white">{file.name}</p>
              <p className="text-sm text-zinc-400">{formatFileSize(file.size)}</p>
            </div>
            <p className="text-xs text-zinc-500">
              Click or drag to replace
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="mx-auto h-12 w-12 text-zinc-500" />
            <div>
              <p className="font-medium text-zinc-300">
                Drag & drop audio/video file
              </p>
              <p className="text-sm text-zinc-500">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-zinc-600">
              MP3, WAV, MP4, MOV, WebM (max 500 MB)
            </p>
          </div>
        )}
      </div>

      {/* Words per Line */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
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
        <p className="mt-2 text-xs text-zinc-500">
          Number of words grouped together in each caption line
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!file || isUploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-power-yellow px-6 py-4 text-lg font-semibold text-black transition-all hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Uploading...
          </>
        ) : (
          "Generate Captions"
        )}
      </button>
    </div>
  );
}
