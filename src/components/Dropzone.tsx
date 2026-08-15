import { useState, useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { play } from "cuelume";
import { mergeImagesHorizontally } from "../utils/imageMerger";

const styles: { [key: string]: React.CSSProperties } = {
  hiddenInput: { display: "none" },
  loader: { animation: "spin 1s linear infinite" },
  textContainerProcessing: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  title: { fontSize: "1.2rem", fontWeight: 600 },
  subtitleProcessing: { color: "var(--text-secondary)", fontSize: "0.9rem" },
  textContainer: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  subtitle: {
    color: "var(--text-secondary)",
    fontSize: "0.9rem",
    lineHeight: "1.4",
  },
};

interface DropzoneProps {
  onFileSelect: (file: File) => void;
}

export function Dropzone({ onFileSelect }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length === 0) {
      alert("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    if (files.length > 5) {
      alert(
        "Por favor, selecione no máximo 5 imagens por vez para evitar travamentos no navegador.",
      );
      return;
    }

    if (files.length === 1) {
      play("success");
      onFileSelect(files[0]);
      return;
    }

    setIsProcessing(true);
    try {
      const mergedFile = await mergeImagesHorizontally(files);
      play("success");
      onFileSelect(mergedFile);
    } catch (error) {
      console.error(error);
      alert("Erro ao mesclar imagens.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!isProcessing) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
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
        multiple
        style={styles.hiddenInput}
      />
      {isProcessing ? (
        <>
          <Loader2 className="dropzone-icon" style={styles.loader} />
          <div style={styles.textContainerProcessing}>
            <h3 style={styles.title}>Costurando imagens...</h3>
            <p style={styles.subtitleProcessing}>
              Isso pode levar alguns segundos.
            </p>
          </div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </>
      ) : (
        <>
          <UploadCloud className="dropzone-icon" />
          <div style={styles.textContainer}>
            <h3 style={styles.title}>
              Arraste imagens ou clique para selecionar
            </h3>
            <p style={styles.subtitle}>
              Ao abrir múltiplos arquivos (até 5), eles serão automaticamente
              <br />
              <b>colados lado a lado horizontalmente</b> formando um panorama.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
