import { useState, useRef } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Check, X } from "lucide-react";

interface CropperModalProps {
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
}

export function CropperModal({
  imageUrl,
  onClose,
  onCropComplete,
}: CropperModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const imageRef = useRef<HTMLImageElement>(null);

  const handleApplyCrop = () => {
    if (imageRef.current && crop && crop.width && crop.height) {
      const canvas = document.createElement("canvas");
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(
          imageRef.current,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height,
        );
        const base64Image = canvas.toDataURL("image/png");
        onCropComplete(base64Image);
      }
    } else {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "var(--bg-color)",
          padding: "2rem",
          borderRadius: "var(--radius-lg)",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
          border: "1px solid var(--card-border)",
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>
          Recortar Imagem
        </h2>

        <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            style={{ maxWidth: "100%", maxHeight: "60vh" }}
          />
        </ReactCrop>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "2rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            className="btn-icon"
            onClick={onClose}
            style={{ color: "#ef4444", borderColor: "#ef4444" }}
          >
            <X size={20} /> Cancelar
          </button>
          <button
            className="btn-icon"
            onClick={handleApplyCrop}
            style={{ color: "var(--accent-1)", borderColor: "var(--accent-1)" }}
          >
            <Check size={20} /> Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
