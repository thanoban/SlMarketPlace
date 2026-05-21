"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspectRatio?: "banner" | "square";
}

export default function ImageUpload({
  value,
  onChange,
  folder = "slevents",
  label = "Upload image",
  aspectRatio = "banner",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="w-full">
      {value ? (
        <div className={cn("relative rounded-lg overflow-hidden border border-gray-200", aspectRatio === "banner" ? "h-40" : "h-32 w-32")}>
          <Image
            src={value}
            alt="Uploaded"
            fill
            className="object-cover"
            sizes="400px"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white shadow"
          >
            <X className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors",
            aspectRatio === "banner" ? "h-40" : "h-32 w-32",
            uploading && "opacity-50 pointer-events-none"
          )}
        >
          {uploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500 text-center px-2">{label}</span>
              <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · max 5MB</span>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
