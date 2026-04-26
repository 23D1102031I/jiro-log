"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, AlertCircle, Image as ImageIcon } from "lucide-react";

const MAX_FILES = 5;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1200;

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("圧縮失敗"))),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export interface ImageItem {
  id: string;
  preview: string;
  blob: Blob;
  originalName: string;
}

interface Props {
  onChange: (items: ImageItem[]) => void;
}

export function ImageUploader({ onChange }: Props) {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      setError(null);
      const accepted: File[] = [];

      for (const file of Array.from(files)) {
        if (!["image/jpeg", "image/png"].includes(file.type)) {
          setError("JPEG・PNGのみ対応しています");
          return;
        }
        if (file.size > MAX_SIZE_BYTES) {
          setError(`${file.name}：ファイルサイズが5MBを超えています`);
          return;
        }
        accepted.push(file);
      }

      if (items.length + accepted.length > MAX_FILES) {
        setError(`画像は最大${MAX_FILES}枚まです`);
        return;
      }

      setCompressing(true);
      const newItems: ImageItem[] = [];
      for (const file of accepted) {
        try {
          const blob = file.size > 500 * 1024 ? await compressImage(file) : file;
          const preview = URL.createObjectURL(blob);
          newItems.push({ id: crypto.randomUUID(), preview, blob, originalName: file.name });
        } catch {
          setError("画像の処理に失敗しました");
        }
      }
      setCompressing(false);

      const updated = [...items, ...newItems];
      setItems(updated);
      onChange(updated);
    },
    [items, onChange]
  );

  const remove = useCallback(
    (id: string) => {
      const updated = items.filter((i) => i.id !== id);
      setItems(updated);
      onChange(updated);
    },
    [items, onChange]
  );

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#FFFF00] rounded-xl p-8 text-center transition-colors"
      >
        {compressing ? (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="w-5 h-5 border-2 border-[#FFFF00] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">圧縮中...</span>
          </div>
        ) : (
          <>
            <Upload className="mx-auto w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-600">タップして画像を追加</p>
            <p className="text-xs text-gray-400 mt-1">JPEG / PNG・最大{MAX_FILES}枚・各5MB以下</p>
          </>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.preview} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label="削除"
                onClick={() => remove(item.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 hover:bg-black rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {items.length < MAX_FILES && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-gray-400 transition-colors text-gray-300"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs">追加</span>
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}
