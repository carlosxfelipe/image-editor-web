import { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text,
  Arrow,
  Transformer,
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
} from "lucide-react";
import { CropperModal } from "./CropperModal";

interface EditorProps {
  imageFile: File;
  onReset: () => void;
}

type ItemType = "text" | "arrow" | "image";

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
}

export function Editor({ imageFile, onReset }: EditorProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [image] = useImage(imageUrl);

  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mainRotation, setMainRotation] = useState(0);

  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const [isCropping, setIsCropping] = useState(false);

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

  const handleDownload = () => {
    setSelectedId(null); // Remove selection to hide transformer
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "edited-image.png";
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        <button
          className="btn-icon"
          onClick={() => setIsCropping(true)}
          title="Recortar"
        >
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

        <label
          className="btn-icon"
          style={{ cursor: "pointer" }}
          title="Colar Imagem"
        >
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleExtraImageUpload}
          />
          <ImageIcon size={20} />
        </label>

        {(() => {
          const selectedItem = items.find((i) => i.id === selectedId);
          if (!selectedItem) return null;

          return (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                borderLeft: "1px solid var(--card-border)",
                paddingLeft: "1rem",
                marginLeft: "0.5rem",
              }}
            >
              {[
                "#ef4444",
                "#8b5cf6",
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
                    style={{ marginLeft: "0.5rem" }}
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

              <button
                className="btn-icon"
                onClick={deleteSelected}
                style={{
                  color: "#ef4444",
                  borderColor: "#ef4444",
                  marginLeft: "0.5rem",
                }}
                title="Apagar Selecionado"
              >
                <Trash2 size={20} />
              </button>
            </div>
          );
        })()}
      </div>

      <div
        style={{
          border: "1px solid var(--card-border)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          display: "inline-block",
          background: "rgba(0,0,0,0.5)",
        }}
      >
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

      <div
        style={{
          marginTop: "0.75rem",
          color: "var(--text-secondary)",
          fontSize: "0.9rem",
          textAlign: "center",
          width: "100%",
        }}
      >
        Resolução Original: {imgWidth} x {imgHeight} px
      </div>

      <div className="actions-container">
        <button
          className="btn-primary"
          onClick={onReset}
          style={{
            background: "transparent",
            border: "1px solid var(--card-border)",
          }}
        >
          Cancelar
        </button>
        <button className="btn-primary" onClick={handleDownload}>
          <Download size={20} /> Salvar Imagem
        </button>
      </div>

      {isCropping && (
        <CropperModal
          imageUrl={imageUrl}
          onClose={() => setIsCropping(false)}
          onCropComplete={(newUrl) => {
            setImageUrl(newUrl);
            setIsCropping(false);
          }}
        />
      )}
    </div>
  );
}
