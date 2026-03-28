/**
 * ScratchpadCanvas — the drawing surface for handwritten clinical notes.
 *
 * CRITICAL: touch-action is set to 'none' on the canvas element.
 * Without this, the browser intercepts touch events as scroll gestures.
 * Scribbling becomes impossible. This is the single most important
 * CSS property in this component.
 *
 * Uses PointerEvents API (not MouseEvents or TouchEvents).
 * PointerEvents handles mouse, touch, and stylus uniformly.
 */

import React, { useRef, useEffect } from 'react';
import type { StrokePoint } from '../../hooks/useScratchpad';

interface ScratchpadCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onStartStroke: (point: StrokePoint) => void;
  onContinueStroke: (point: StrokePoint) => void;
  onEndStroke: () => void;
  isProcessing: boolean;
}

/**
 * Extracts a StrokePoint from a PointerEvent, accounting for canvas position.
 * Stylus pressure is used when available; defaults to 0.5 for finger/mouse.
 */
function extractPoint(event: PointerEvent, canvas: HTMLCanvasElement): StrokePoint {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    pressure: event.pressure > 0 ? event.pressure : 0.5,
    timestamp: Date.now(),
  };
}

const ScratchpadCanvas: React.FC<ScratchpadCanvasProps> = ({
  canvasRef,
  onStartStroke,
  onContinueStroke,
  onEndStroke,
  isProcessing,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Size canvas to fill its container, handling window resizes
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      // Match canvas pixel dimensions to CSS dimensions
      // so drawing coordinates align with pointer event coordinates
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [canvasRef]);

  // Attach pointer event listeners directly to the canvas DOM element.
  // We use addEventListener (not React event props) to pass { passive: false }
  // which allows calling preventDefault() — necessary to block scroll on some devices.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (isProcessing) return;
      event.preventDefault();
      // Capture pointer so we receive events even if pointer leaves canvas
      canvas.setPointerCapture(event.pointerId);
      onStartStroke(extractPoint(event, canvas));
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (isProcessing) return;
      event.preventDefault();
      // Only draw if a button is pressed (left mouse / active stylus / touch)
      if (event.buttons === 0) return;
      onContinueStroke(extractPoint(event, canvas));
    };

    const handlePointerUp = (event: PointerEvent) => {
      event.preventDefault();
      onEndStroke();
    };

    const handlePointerLeave = (event: PointerEvent) => {
      // End stroke if pointer leaves canvas while drawing
      if (event.buttons > 0) {
        onEndStroke();
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
    canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
    canvas.addEventListener('pointerup', handlePointerUp, { passive: false });
    canvas.addEventListener('pointerleave', handlePointerLeave, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  // Re-attach when processing state or handlers change
  }, [canvasRef, isProcessing, onStartStroke, onContinueStroke, onEndStroke]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          // CRITICAL: touch-action none prevents browser scroll interception
          touchAction: 'none',
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: isProcessing ? 'wait' : 'crosshair',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />
    </div>
  );
};

export default ScratchpadCanvas;
