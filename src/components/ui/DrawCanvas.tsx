import { useEffect, useRef } from 'react';

interface DrawCanvasProps {
  onSubmit: (dataUrl: string) => void;
}

export default function DrawCanvas({ onSubmit }: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  let drawing = false;

  // Initialize the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctxRef.current = ctx;
      ctx!.lineWidth = 3;
      ctx!.lineCap = 'round';
      ctx!.strokeStyle = 'black';
    }
  }, []);

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while drawing
    drawing = true;
    ctxRef.current?.beginPath();
    draw(e);
  };

  // Stop drawing
  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent unwanted touch events
    drawing = false;
    ctxRef.current?.closePath();
  };

  // Draw on the canvas
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent the default touch behavior (scrolling)
    if (!drawing) return;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const rect = canvas!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx!.lineTo(clientX - rect.left, clientY - rect.top);
    ctx!.stroke();
  };

  // Submit the drawing as an image (data URL)
  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSubmit(dataUrl);
    }
  };

  // Clear the canvas
  const handleClear = () => {
    ctxRef.current?.clearRect(0, 0, 400, 300);
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="border border-gray-400 touch-none"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
      />
      <div className="flex gap-4 mt-4">
        <button onClick={handleSubmit} className="btn btn-primary">
          Submit
        </button>
        <button onClick={handleClear} className="btn btn-secondary">
          Clear
        </button>
      </div>
    </div>
  );
}
