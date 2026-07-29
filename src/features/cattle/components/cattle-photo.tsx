"use client";

import { Beef, Camera, ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

function CowSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="82" cy="78" rx="48" ry="28" fill="currentColor" opacity="0.22" />
      <path
        d="M38 62c2-18 18-30 40-30 16 0 28 6 36 16 6 7 10 12 18 12 4 0 8-1 10-3l4 8c-4 4-10 6-16 6-10 0-16-4-22-10-6 10-18 16-30 16-22 0-38-12-40-15z"
        fill="currentColor"
        opacity="0.55"
      />
      <circle cx="118" cy="48" r="12" fill="currentColor" opacity="0.55" />
      <path
        d="M126 42c4-6 10-8 14-6M112 42c-3-5-8-7-12-5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M56 88v14M72 90v14M92 90v14M108 88v14"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle cx="122" cy="46" r="1.8" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function PhotoPlaceholder({
  size,
  className,
  tagHint,
  alt,
}: {
  size: "sm" | "md" | "lg" | "card" | "hero";
  className?: string;
  tagHint?: string;
  alt: string;
}) {
  const sizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-24 w-24",
    card: "aspect-[4/3] w-full",
    hero: "aspect-[4/3] w-full max-h-80",
  };
  const isLarge = size === "hero" || size === "card";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl",
        "bg-[linear-gradient(145deg,#d7e5dd_0%,#eef4f0_45%,#cfe0d6_100%)]",
        "text-primary/70 dark:bg-[linear-gradient(145deg,#13241d_0%,#1a3027_50%,#0f1c17_100%)]",
        sizes[size],
        className,
      )}
      aria-label={`${alt} — no photo`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.55),transparent_45%)]" />
      {isLarge ? (
        <div className="relative flex flex-col items-center gap-2 px-4">
          <CowSilhouette className="h-24 w-32 text-primary" />
          <p className="text-center text-xs font-semibold tracking-wide text-primary/80">
            {tagHint || "No photo yet"}
          </p>
        </div>
      ) : (
        <Beef className="relative h-5 w-5" />
      )}
    </div>
  );
}

export function CattlePhoto({
  src,
  alt,
  className,
  size = "md",
  tagHint,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "card" | "hero";
  tagHint?: string;
}) {
  const [broken, setBroken] = useState(false);
  const sizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-24 w-24",
    card: "aspect-[4/3] w-full",
    hero: "aspect-[4/3] w-full max-h-80",
  };

  if (!src || broken) {
    return (
      <PhotoPlaceholder size={size} className={className} tagHint={tagHint} alt={alt} />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("rounded-2xl object-cover bg-muted", sizes[size], className)}
      onError={() => setBroken(true)}
    />
  );
}

function CameraCaptureModal({
  open,
  label,
  onClose,
  onCapture,
}: {
  open: boolean;
  label: string;
  onClose: () => void;
  onCapture: (file: File) => void;
}) {
  const { language } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const tTake = language === "am" ? "ፎቶ አንሳ" : language === "om" ? "Suuraa Kaasi" : "Take photo";
  const tCap = language === "am" ? "ፎቶውን ያንሱ" : language === "om" ? "Waraabi" : "Capture";
  const tCancel = language === "am" ? "ሰርዝ" : language === "om" ? "Dhiisi" : "Cancel";

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);
    setReady(false);

    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError(
            language === "am"
              ? "ካሜራው በዚህ ብራውዘር አይደገፍም። ከጋለሪ ይምረጡ።"
              : "Camera is not supported in this browser. Choose photo from gallery.",
          );
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError(
          language === "am"
            ? "ካሜራውን መክፈት አልተቻለም። ፈቃድ ይስጡ ወይም ከጋለሪ ይምረጡ።"
            : "Could not open camera. Allow access or choose from gallery.",
        );
      }
    }

    void start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, language]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function handleClose() {
    stopCamera();
    onClose();
  }

  function shoot() {
    const video = videoRef.current;
    if (!video || !ready) return;
    const canvas = document.createElement("canvas");
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 960;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `${label.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        stopCamera();
        onCapture(file);
        onClose();
      },
      "image/jpeg",
      0.92,
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close camera"
        onClick={handleClose}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-3xl border border-border bg-card p-4 shadow-[var(--shadow-md)] sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold">{tTake}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-black aspect-[4/3]">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          {!ready && !error ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
              {language === "am" ? "ካሜራ በመክፈት ላይ..." : "Starting camera…"}
            </div>
          ) : null}
        </div>

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <div className="mt-4 flex gap-2">
          <Button type="button" className="flex-1" onClick={shoot} disabled={!ready}>
            <Camera className="h-4 w-4" />
            {tCap}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {tCancel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PhotoUploadField({
  label,
  preview,
  onChange,
  required,
}: {
  label: string;
  preview: string | null;
  onChange: (file: File | null) => void;
  required?: boolean;
}) {
  const { language } = useTranslation();
  const galleryRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const tGal = language === "am" ? "ጋለሪ" : language === "om" ? "Galaarii" : "Gallery";
  const tPhoto = language === "am" ? "ፎቶ አንሳ" : language === "om" ? "Suuraa Kaasi" : "Take photo";
  const tClear = language === "am" ? "አጽዳ" : language === "om" ? "Qulqulleessi" : "Clear";
  const tHelp =
    language === "am"
      ? "ጋለሪ ፋይሎችን ይከፍታል። ፎቶ አንሳ ካሜራውን ይከፍታል።"
      : language === "om"
        ? "Galaariin faayiloota bana. Suuraa kaasi kaameraa bana."
        : "Gallery opens files. Take photo opens the camera.";

  function handleFile(file: File | null) {
    onChange(file);
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>

      <div className="flex items-start gap-3">
        <CattlePhoto src={preview} alt={label} size="md" className="shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => galleryRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" />
              {tGal}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCameraOpen(true)}
            >
              <Camera className="h-4 w-4" />
              {tPhoto}
            </Button>
            {preview ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => handleFile(null)}>
                {tClear}
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">{tHelp}</p>
        </div>
      </div>

      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      <CameraCaptureModal
        open={cameraOpen}
        label={label}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => handleFile(file)}
      />
    </div>
  );
}
