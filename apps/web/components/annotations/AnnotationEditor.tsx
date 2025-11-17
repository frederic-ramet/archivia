'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';

interface Annotation {
  id: string;
  type: 'note' | 'correction' | 'hotspot' | 'region';
  content?: string | null;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
  metadata: Record<string, unknown>;
}

interface AnnotationEditorProps {
  documentId: string;
  imageSrc: string;
  onSave?: (annotation: Omit<Annotation, 'id'>) => Promise<void>;
  onUpdate?: (annotationId: string, data: Partial<Annotation>) => Promise<void>;
  onDelete?: (annotationId: string) => Promise<void>;
  initialAnnotations?: Annotation[];
}

type Tool = 'select' | 'rectangle' | 'circle' | 'note' | 'highlight' | 'region' | 'hotspot';

interface Shape {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
}

export default function AnnotationEditor({
  imageSrc,
  onSave,
  onDelete,
  initialAnnotations = [],
}: AnnotationEditorProps) {
  const [tool, setTool] = useState<Tool>('select');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [color, setColor] = useState('#FF6B6B');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load image and calculate dimensions
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      const maxWidth = 1200;
      const maxHeight = 800;

      let width = img.width;
      let height = img.height;

      // Scale down if too large
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      setImageSize({ width, height });
      setStageSize({ width, height });
    };
  }, [imageSrc]);

  // Load initial annotations
  useEffect(() => {
    if (initialAnnotations.length > 0) {
      const loadedShapes: Shape[] = initialAnnotations
        .filter(ann => ann.x !== null && ann.y !== null)
        .map(ann => ({
          id: ann.id,
          type: ann.type as Tool,
          x: ann.x!,
          y: ann.y!,
          width: ann.width || 100,
          height: ann.height || 100,
          radius: ann.width ? ann.width / 2 : 50,
          text: ann.content || '',
          color: (ann.metadata.color as string) || '#FF6B6B',
        }));
      setShapes(loadedShapes);
    }
  }, [initialAnnotations]);

  // Handle transformer selection
  useEffect(() => {
    if (selectedId && transformerRef.current && layerRef.current) {
      const selectedNode = layerRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedId]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === 'select') return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setDrawing(true);
    const id = `shape-${Date.now()}`;

    let newShape: Shape = {
      id,
      type: tool,
      x: pos.x,
      y: pos.y,
      color,
    };

    if (tool === 'rectangle' || tool === 'highlight') {
      newShape = { ...newShape, width: 0, height: 0 };
    } else if (tool === 'circle') {
      newShape = { ...newShape, radius: 0 };
    } else if (tool === 'note') {
      const text = prompt('Enter note text:');
      if (text) {
        newShape = { ...newShape, text, width: 200, height: 100 };
      } else {
        setDrawing(false);
        return;
      }
    }

    setCurrentShape(newShape);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!drawing || !currentShape || tool === 'note') return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const updated = { ...currentShape };

    if (tool === 'rectangle' || tool === 'highlight') {
      updated.width = pos.x - currentShape.x;
      updated.height = pos.y - currentShape.y;
    } else if (tool === 'circle') {
      const dx = pos.x - currentShape.x;
      const dy = pos.y - currentShape.y;
      updated.radius = Math.sqrt(dx * dx + dy * dy);
    }

    setCurrentShape(updated);
  };

  const handleMouseUp = async () => {
    if (!drawing || !currentShape) return;

    setDrawing(false);

    // Add shape if it has valid dimensions
    const isValid =
      (currentShape.type === 'note') ||
      (currentShape.type === 'rectangle' && Math.abs(currentShape.width || 0) > 5 && Math.abs(currentShape.height || 0) > 5) ||
      (currentShape.type === 'highlight' && Math.abs(currentShape.width || 0) > 5 && Math.abs(currentShape.height || 0) > 5) ||
      (currentShape.type === 'circle' && (currentShape.radius || 0) > 5);

    if (isValid) {
      setShapes([...shapes, currentShape]);

      // Save to backend if onSave is provided
      if (onSave) {
        try {
          await onSave({
            type: currentShape.type as 'note' | 'correction' | 'hotspot' | 'region',
            content: currentShape.text || null,
            x: currentShape.x,
            y: currentShape.y,
            width: currentShape.width || currentShape.radius || null,
            height: currentShape.height || currentShape.radius || null,
            metadata: { color: currentShape.color },
          });
        } catch (error) {
          console.error('Failed to save annotation:', error);
        }
      }
    }

    setCurrentShape(null);
  };

  const handleShapeClick = (id: string) => {
    if (tool === 'select') {
      setSelectedId(id);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    setShapes(shapes.filter(s => s.id !== selectedId));

    if (onDelete) {
      try {
        await onDelete(selectedId);
      } catch (error) {
        console.error('Failed to delete annotation:', error);
      }
    }

    setSelectedId(null);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking empty area
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  const renderShape = (shape: Shape) => {
    const commonProps = {
      id: shape.id,
      key: shape.id,
      onClick: () => handleShapeClick(shape.id),
      stroke: shape.color,
      strokeWidth: 2,
      draggable: tool === 'select',
    };

    switch (shape.type) {
      case 'rectangle':
      case 'region':
        return (
          <Rect
            {...commonProps}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill="transparent"
          />
        );

      case 'circle':
      case 'hotspot':
        return (
          <Circle
            {...commonProps}
            x={shape.x}
            y={shape.y}
            radius={shape.radius}
            fill="transparent"
          />
        );

      case 'highlight':
        return (
          <Rect
            {...commonProps}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={shape.color}
            opacity={0.3}
            strokeWidth={0}
          />
        );

      case 'note':
        return (
          <>
            <Rect
              {...commonProps}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              fill="#FFFEF0"
              stroke={shape.color}
            />
            <Text
              id={`${shape.id}-text`}
              key={`${shape.id}-text`}
              x={shape.x + 10}
              y={shape.y + 10}
              width={(shape.width || 200) - 20}
              text={shape.text || ''}
              fontSize={14}
              fill="#000"
              listening={false}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setTool('select')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tool === 'select'
                ? 'bg-heritage-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Select and move annotations"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </button>
          <button
            onClick={() => setTool('rectangle')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tool === 'rectangle'
                ? 'bg-heritage-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Draw rectangle"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" strokeWidth={2} />
            </svg>
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tool === 'circle'
                ? 'bg-heritage-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Draw circle"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
            </svg>
          </button>
          <button
            onClick={() => setTool('highlight')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tool === 'highlight'
                ? 'bg-heritage-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Highlight area"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => setTool('note')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tool === 'note'
                ? 'bg-heritage-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Add note"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
        </div>

        <div className="border-l border-gray-300 pl-4 flex items-center gap-2">
          <label className="text-sm text-gray-700 font-medium">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
          />
        </div>

        {selectedId && (
          <button
            onClick={handleDelete}
            className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            Delete Selected
          </button>
        )}

        <div className="text-sm text-gray-600 ml-auto">
          {shapes.length} annotation{shapes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleStageClick}
          >
            <Layer ref={layerRef}>
              {/* Background Image */}
              {imageRef.current && (
                <KonvaImage
                  image={imageRef.current}
                  width={imageSize.width}
                  height={imageSize.height}
                />
              )}

              {/* Existing shapes */}
              {shapes.map(renderShape)}

              {/* Current shape being drawn */}
              {currentShape && renderShape(currentShape)}

              {/* Transformer for selected shape */}
              {tool === 'select' && <Transformer ref={transformerRef} />}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-100 border-t border-gray-200 p-3 text-sm text-gray-600">
        {tool === 'select' && 'Click and drag to move annotations. Click a shape to select it.'}
        {tool === 'rectangle' && 'Click and drag to draw a rectangle annotation.'}
        {tool === 'circle' && 'Click and drag to draw a circle annotation.'}
        {tool === 'highlight' && 'Click and drag to highlight an area.'}
        {tool === 'note' && 'Click to add a text note.'}
      </div>
    </div>
  );
}
