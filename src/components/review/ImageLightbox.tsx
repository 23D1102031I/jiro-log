"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
}

export function ImageLightbox({ images }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const [first, ...rest] = images;

  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, prev, next]);

  const openAt = (i: number) => { setIndex(i); setOpen(true); };

  return (
    <>
      {/* 画像グリッド */}
      <div className="space-y-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={first}
          alt=""
          onClick={() => openAt(0)}
          className="rounded-2xl w-full aspect-video object-cover cursor-zoom-in"
        />
        {rest.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {rest.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt=""
                onClick={() => openAt(i + 1)}
                className="rounded-xl w-full aspect-square object-cover cursor-zoom-in"
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setOpen(false)}
        >
          {/* 閉じるボタン */}
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={() => setOpen(false)}
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 前へ */}
          {images.length > 1 && (
            <button
              className="absolute left-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="前の画像"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* メイン画像 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
          />

          {/* 次へ */}
          {images.length > 1 && (
            <button
              className="absolute right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="次の画像"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* インジケーター */}
          {images.length > 1 && (
            <div className="absolute bottom-4 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
