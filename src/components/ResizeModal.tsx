import { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";

interface ResizeModalProps {
  imageUrl: string;
  onClose: () => void;
  onResizeComplete: (resizedImageUrl: string) => void;
}

export function ResizeModal({
  imageUrl,
  onClose,
  onResizeComplete,
}: ResizeModalProps) {
  const [width, setWidth] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [keepRatio, setKeepRatio] = useState(true);

  const ratioRef = useRef<number>(1);
  const originalSize = useRef<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
      ratioRef.current = img.width / img.height;
      originalSize.current = { width: img.width, height: img.height };
    };
  }, [imageUrl]);

  const applyPercentage = (percent: number) => {
    if (originalSize.current) {
      setWidth(Math.round(originalSize.current.width * percent));
      setHeight(Math.round(originalSize.current.height * percent));
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : "";
    setWidth(val);
    if (keepRatio && typeof val === "number" && ratioRef.current) {
      setHeight(Math.round(val / ratioRef.current));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : "";
    setHeight(val);
    if (keepRatio && typeof val === "number" && ratioRef.current) {
      setWidth(Math.round(val * ratioRef.current));
    }
  };

  const handleApplyResize = () => {
    if (!width || !height) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width as number;
      canvas.height = height as number;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0, width as number, height as number);
        const base64Image = canvas.toDataURL("image/png");
        onResizeComplete(base64Image);
      }
    };
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.title}>Redimensionar Imagem</h2>

        <div style={styles.formContainer}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Largura (px)</label>
            <input
              type="number"
              value={width}
              onChange={handleWidthChange}
              style={styles.input}
              min="1"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Altura (px)</label>
            <input
              type="number"
              value={height}
              onChange={handleHeightChange}
              style={styles.input}
              min="1"
            />
          </div>
        </div>

        <div style={styles.quickActions}>
          <button style={styles.quickBtn} onClick={() => applyPercentage(0.25)}>
            25%
          </button>
          <button style={styles.quickBtn} onClick={() => applyPercentage(0.5)}>
            50%
          </button>
          <button style={styles.quickBtn} onClick={() => applyPercentage(0.75)}>
            75%
          </button>
          <button style={styles.quickBtn} onClick={() => applyPercentage(2.0)}>
            200%
          </button>
        </div>

        <div style={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="keepRatio"
            checked={keepRatio}
            onChange={(e) => setKeepRatio(e.target.checked)}
            style={styles.checkbox}
          />
          <label htmlFor="keepRatio" style={styles.labelCheckbox}>
            Manter proporção
          </label>
        </div>

        <div style={styles.buttonContainer}>
          <button
            className="btn-icon"
            onClick={onClose}
            style={styles.cancelButton}
          >
            <X size={20} /> Cancelar
          </button>
          <button
            className="btn-icon"
            onClick={handleApplyResize}
            style={styles.applyButton}
            disabled={!width || !height}
          >
            <Check size={20} /> Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
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
  },
  modalContent: {
    background: "var(--bg-color)",
    padding: "2rem",
    borderRadius: "var(--radius-lg)",
    maxWidth: "90vw",
    width: "400px",
    border: "1px solid var(--card-border)",
  },
  title: { marginBottom: "1.5rem", color: "var(--text-primary)" },
  formContainer: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  },
  quickActions: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  quickBtn: {
    flex: 1,
    padding: "0.4rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--card-border)",
    background: "var(--btn-icon-bg)",
    color: "var(--text-secondary)",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  label: {
    color: "var(--text-secondary)",
    fontSize: "0.9rem",
    marginBottom: "0.5rem",
  },
  labelCheckbox: {
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.75rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--card-border)",
    background: "var(--card-bg)",
    color: "var(--text-primary)",
    fontSize: "1rem",
  },
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "2rem",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  buttonContainer: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
  },
  cancelButton: { color: "#ef4444", borderColor: "#ef4444" },
  applyButton: { color: "var(--accent-1)", borderColor: "var(--accent-1)" },
};
