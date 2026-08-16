import { useState, useRef, useEffect } from "react";
import Konva from "konva";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text,
  Arrow,
  Transformer,
  Group,
  Rect,
} from "react-konva";
import useImage from "use-image";
import { v4 as uuidv4 } from "uuid";
import {
  RotateCw,
  Type,
  Image as ImageIcon,
  Download,
  Trash2,
  ArrowUpRight,
  ArrowRightLeft,
  Crop as CropIcon,
  Droplet,
  Grid,
} from "lucide-react";
import { CropperModal } from "./CropperModal";

interface EditorProps {
  imageFile: File;
  onReset: () => void;
}

type ItemType = "text" | "arrow" | "image" | "filter-box";

interface CanvasItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  rotation: number;
  scaleX?: number;
  scaleY?: number;
  text?: string;
  imageObj?: HTMLImageElement;
  color?: string;
  isDashed?: boolean;
  isDouble?: boolean;
  width?: number;
  height?: number;
  filterType?: "blur" | "pixelate";
}

const FilteredImage = ({ image, filterType, ...props }: any) => {
  const imageRef = useRef<any>(null);

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.cache();
    }
  }, [image, filterType]);

  return (
    <KonvaImage
      ref={imageRef}
      image={image}
      filters={
        filterType === "blur" ? [Konva.Filters.Blur] : [Konva.Filters.Pixelate]
      }
      blurRadius={20}
      pixelSize={10}
      {...props}
    />
  );
};

export function Editor({ imageFile, onReset }: EditorProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [image] = useImage(imageUrl);

  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mainRotation, setMainRotation] = useState(0);

  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const [isCropping, setIsCropping] = useState(false);
  const [flattenedImageUrl, setFlattenedImageUrl] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // Handle Selection
  const checkDeselect = (e: any) => {
    const clickedOnEmpty =
      e.target === e.target.getStage() || e.target.name() === "main-image";
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  useEffect(() => {
    if (selectedId && trRef.current) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, items]);

  const handleDragEnd = (e: any, id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, x: e.target.x(), y: e.target.y() } : item,
      ),
    );
  };

  const handleTransformEnd = (id: string) => {
    const node = stageRef.current.findOne(`#${id}`);
    if (node) {
      setItems(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                x: node.x(),
                y: node.y(),
                rotation: node.rotation(),
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
              }
            : item,
        ),
      );
    }
  };

  const addText = () => {
    const text = prompt("Digite o texto:");
    if (text) {
      setItems([
        ...items,
        {
          id: uuidv4(),
          type: "text",
          x: 50,
          y: 50,
          rotation: 0,
          text,
          color: "#8b5cf6",
        },
      ]);
    }
  };

  const addArrow = () => {
    setItems([
      ...items,
      {
        id: uuidv4(),
        type: "arrow",
        x: 50,
        y: 50,
        rotation: 0,
        color: "#ef4444",
        isDashed: false,
        isDouble: false,
      },
    ]);
  };

  const addFilterBox = (filterType: "blur" | "pixelate") => {
    setItems([
      ...items,
      {
        id: uuidv4(),
        type: "filter-box",
        x: 50,
        y: 50,
        rotation: 0,
        width: 150,
        height: 150,
        filterType,
      },
    ]);
  };

  const rotateMain = () => {
    setMainRotation((prev) => (prev + 90) % 360);
  };

  const handleExtraImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        let initialScale = 1;
        if (img.width > 200) {
          initialScale = 200 / img.width;
        }
        setItems([
          ...items,
          {
            id: uuidv4(),
            type: "image",
            x: 50,
            y: 50,
            rotation: 0,
            scaleX: initialScale,
            scaleY: initialScale,
            imageObj: img,
          },
        ]);
      };
    }
  };

  const updateItemProperty = (
    id: string,
    property: keyof CanvasItem,
    value: any,
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [property]: value } : item,
      ),
    );
  };

  const deleteSelected = () => {
    if (selectedId) {
      setItems(items.filter((item) => item.id !== selectedId));
      setSelectedId(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, items]);

  const getExportPixelRatio = () => {
    const isRotated = mainRotation === 90 || mainRotation === 270;
    const imgW = isRotated ? image.height : image.width;
    const maxWidth = Math.min(window.innerWidth - 80, 800);
    const currentScale = Math.min(maxWidth / imgW, 1);
    return 1 / currentScale;
  };

  const handleDownload = () => {
    setSelectedId(null); // Remove selection to hide transformer
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({
        pixelRatio: getExportPixelRatio(),
      });
      const link = document.createElement("a");
      link.download = "edited-image.png";
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 100);
  };

  const handleCropClick = () => {
    setSelectedId(null); // Hide transformer before capture
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({
        pixelRatio: getExportPixelRatio(),
      });
      setFlattenedImageUrl(uri);
      setIsCropping(true);
    }, 100);
  };

  if (!image) return <div className="result-section">Carregando imagem...</div>;

  // Calculate canvas size based on image and rotation
  const isRotated = mainRotation === 90 || mainRotation === 270;
  const imgWidth = image.width;
  const imgHeight = image.height;

  // Responsive sizing
  const maxWidth = Math.min(window.innerWidth - 80, 800);
  const scale = Math.min(maxWidth / (isRotated ? imgHeight : imgWidth), 1);

  const canvasWidth = (isRotated ? imgHeight : imgWidth) * scale;
  const canvasHeight = (isRotated ? imgWidth : imgHeight) * scale;

  return (
    <div className="result-section">
      <div className="toolbar">
        <button className="btn-icon" onClick={handleCropClick} title="Recortar">
          <CropIcon size={20} />
        </button>
        <button className="btn-icon" onClick={rotateMain} title="Rotacionar">
          <RotateCw size={20} />
        </button>
        <button className="btn-icon" onClick={addText} title="Adicionar Texto">
          <Type size={20} />
        </button>
        <button className="btn-icon" onClick={addArrow} title="Adicionar Seta">
          <ArrowUpRight size={20} color="#ef4444" />
        </button>
        <button
          className="btn-icon"
          onClick={() => addFilterBox("blur")}
          title="Adicionar Desfoque"
        >
          <Droplet size={20} />
        </button>
        <button
          className="btn-icon"
          onClick={() => addFilterBox("pixelate")}
          title="Adicionar Pixelado"
        >
          <Grid size={20} />
        </button>

        <label
          className="btn-icon"
          style={styles.uploadLabel}
          title="Colar Imagem"
        >
          <input
            type="file"
            accept="image/*"
            style={styles.hiddenInput}
            onChange={handleExtraImageUpload}
          />
          <ImageIcon size={20} />
        </label>

        {(() => {
          const selectedItem = items.find((i) => i.id === selectedId);
          if (!selectedItem) return null;

          return (
            <div style={styles.contextPanel}>
              {selectedItem.type !== "filter-box" &&
                [
                  "#ef4444",
                  "#8b5cf6",
                  "#3b82f6",
                  "#eab308",
                  "#10b981",
                  "#ffffff",
                  "#000000",
                ].map((c) => (
                  <button
                    key={c}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: c,
                      border: "2px solid",
                      borderColor:
                        selectedItem.color === c ? "white" : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      updateItemProperty(selectedItem.id, "color", c)
                    }
                    title="Mudar Cor"
                  />
                ))}

              {selectedItem.type === "arrow" && (
                <>
                  <button
                    className={`btn-icon ${selectedItem.isDashed ? "active" : ""}`}
                    onClick={() =>
                      updateItemProperty(
                        selectedItem.id,
                        "isDashed",
                        !selectedItem.isDashed,
                      )
                    }
                    title="Tracejado"
                    style={styles.marginLeft}
                  >
                    <ArrowUpRight size={16} strokeDasharray="4 4" />
                  </button>
                  <button
                    className={`btn-icon ${selectedItem.isDouble ? "active" : ""}`}
                    onClick={() =>
                      updateItemProperty(
                        selectedItem.id,
                        "isDouble",
                        !selectedItem.isDouble,
                      )
                    }
                    title="Seta Dupla"
                  >
                    <ArrowRightLeft size={16} />
                  </button>
                </>
              )}

              {selectedItem.type === "filter-box" && (
                <>
                  <button
                    className={`btn-icon ${selectedItem.filterType === "blur" ? "active" : ""}`}
                    onClick={() =>
                      updateItemProperty(selectedItem.id, "filterType", "blur")
                    }
                    title="Desfoque"
                    style={styles.marginLeft}
                  >
                    <Droplet size={16} />
                  </button>
                  <button
                    className={`btn-icon ${selectedItem.filterType === "pixelate" ? "active" : ""}`}
                    onClick={() =>
                      updateItemProperty(
                        selectedItem.id,
                        "filterType",
                        "pixelate",
                      )
                    }
                    title="Pixelado"
                  >
                    <Grid size={16} />
                  </button>
                </>
              )}

              <button
                className="btn-icon"
                onClick={deleteSelected}
                style={styles.deleteButton}
                title="Apagar Selecionado"
              >
                <Trash2 size={20} />
              </button>
            </div>
          );
        })()}
      </div>

      <div style={styles.canvasContainer}>
        <Stage
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
        >
          <Layer>
            <KonvaImage
              image={image}
              name="main-image"
              x={canvasWidth / 2}
              y={canvasHeight / 2}
              offsetX={imgWidth / 2}
              offsetY={imgHeight / 2}
              scaleX={scale}
              scaleY={scale}
              rotation={mainRotation}
            />
            {items.map((item) => {
              const commonProps = {
                id: item.id,
                x: item.x,
                y: item.y,
                rotation: item.rotation,
                scaleX: item.scaleX || 1,
                scaleY: item.scaleY || 1,
                draggable: true,
                onClick: () => setSelectedId(item.id),
                onTap: () => setSelectedId(item.id),
                onDragEnd: (e: any) => handleDragEnd(e, item.id),
                onTransformEnd: () => handleTransformEnd(item.id),
              };

              if (item.type === "text") {
                return (
                  <Text
                    {...commonProps}
                    key={item.id}
                    text={item.text}
                    fontSize={24}
                    fill={item.color || "#8b5cf6"}
                    fontStyle="bold"
                    padding={5}
                  />
                );
              }
              if (item.type === "arrow") {
                const color = item.color || "#ef4444";
                const dash = item.isDashed ? [10, 10] : undefined;
                const pointerAtBeginning = item.isDouble;

                return (
                  <Arrow
                    {...commonProps}
                    key={item.id}
                    points={[0, 0, 100, 100]}
                    pointerLength={10}
                    pointerWidth={10}
                    fill={color}
                    stroke={color}
                    strokeWidth={4}
                    dash={dash}
                    pointerAtBeginning={pointerAtBeginning}
                    hitStrokeWidth={20}
                    strokeScaleEnabled={false}
                  />
                );
              }
              if (item.type === "image" && item.imageObj) {
                return (
                  <KonvaImage
                    {...commonProps}
                    key={item.id}
                    image={item.imageObj}
                  />
                );
              }
              if (item.type === "filter-box") {
                return (
                  <Group key={item.id}>
                    <Group
                      clipFunc={(ctx) => {
                        ctx.save();
                        ctx.translate(item.x, item.y);
                        ctx.rotate((item.rotation * Math.PI) / 180);
                        ctx.beginPath();
                        ctx.rect(
                          0,
                          0,
                          (item.width || 150) * (item.scaleX || 1),
                          (item.height || 150) * (item.scaleY || 1),
                        );
                        ctx.closePath();
                        ctx.restore();
                      }}
                    >
                      <FilteredImage
                        image={image}
                        filterType={item.filterType}
                        x={canvasWidth / 2}
                        y={canvasHeight / 2}
                        offsetX={imgWidth / 2}
                        offsetY={imgHeight / 2}
                        scaleX={scale}
                        scaleY={scale}
                        rotation={mainRotation}
                      />
                    </Group>
                    <Rect
                      {...commonProps}
                      width={item.width || 150}
                      height={item.height || 150}
                      fill="rgba(0,0,0,0.01)"
                      stroke={
                        selectedId === item.id ? "#8b5cf6" : "rgba(0,0,0,0.1)"
                      }
                      strokeWidth={1}
                      dash={[5, 5]}
                    />
                  </Group>
                );
              }
              return null;
            })}
            {selectedId && (
              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) => {
                  const selectedItem = items.find((i) => i.id === selectedId);
                  if (selectedItem?.type === "arrow") return newBox;
                  if (newBox.width < 10 || newBox.height < 10) return oldBox;
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>
      </div>

      <div style={styles.resolutionText}>
        Resolução Original: {imgWidth} x {imgHeight} px
      </div>

      <div className="actions-container">
        <button
          className="btn-primary"
          onClick={onReset}
          style={styles.cancelButton}
        >
          Cancelar
        </button>
        <button className="btn-primary" onClick={handleDownload}>
          <Download size={20} /> Salvar Imagem
        </button>
      </div>

      {isCropping && (
        <CropperModal
          imageUrl={flattenedImageUrl || imageUrl}
          onClose={() => {
            setIsCropping(false);
            setFlattenedImageUrl(null);
          }}
          onCropComplete={(newUrl) => {
            setImageUrl(newUrl);
            setItems([]);
            setMainRotation(0);
            setIsCropping(false);
            setFlattenedImageUrl(null);
          }}
        />
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  uploadLabel: { cursor: "pointer" },
  hiddenInput: { display: "none" },
  contextPanel: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    borderLeft: "1px solid var(--card-border)",
    paddingLeft: "1rem",
    marginLeft: "0.5rem",
  },
  marginLeft: { marginLeft: "0.5rem" },
  deleteButton: {
    color: "#ef4444",
    borderColor: "#ef4444",
    marginLeft: "0.5rem",
  },
  canvasContainer: {
    border: "1px solid var(--card-border)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    display: "inline-block",
    background: "rgba(0,0,0,0.5)",
  },
  resolutionText: {
    marginTop: "0.75rem",
    color: "var(--text-secondary)",
    fontSize: "0.9rem",
    textAlign: "center",
    width: "100%",
  },
  cancelButton: {
    background: "transparent",
    border: "1px solid var(--card-border)",
  },
};
