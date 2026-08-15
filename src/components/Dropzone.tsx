import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { play } from "cuelume";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
}

export function Dropzone({ onFileSelect }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (!isDragging) {
        setIsDragging(true);
        play("tick");
      }
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        play("success");
        onFileSelect(file);
      } else {
        alert("Por favor, selecione um arquivo de imagem válido.");
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        play("success");
        onFileSelect(file);
      }
    }
  };

  return (
    <div
      className={`dropzone ${isDragging ? "dragging" : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      data-cuelume-hover="tick"
      data-cuelume-click="press"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />
      <UploadCloud className="dropzone-icon" />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 600 }}>
          Arraste uma imagem ou clique para selecionar
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Suporta JPG, PNG, WebP, etc.
        </p>
      </div>
    </div>
  );
}
