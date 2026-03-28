/**
 * useScratchpad — manages canvas drawing state and scratchpad submission.
 * Owns the rAF rendering loop, stroke accumulation, and service call.
 * The canvas component renders the <canvas> element; this hook drives everything else.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { OPInitialAssessment } from '../types/OPInitialAssessment';
import type { OPFollowUpAssessment } from '../types/OPFollowUpAssessment';
import type { StructuredSOAPNote } from '../types/clinical';
import { scratchpadService, type ClinicalPatientContext } from '../services/scratchpad/scratchpadService';

// ---------------------------------------------------------------------------
// Types — exported so consumers can reference them
// ---------------------------------------------------------------------------

export interface StrokePoint {
  x: number;
  y: number;
  /** Stylus pressure 0–1. Defaults to 0.5 if device does not report pressure. */
  pressure: number;
  timestamp: number;
}

export interface Stroke {
  points: StrokePoint[];
  color: string;
  width: number;
}

export type ScratchpadNote = OPInitialAssessment | OPFollowUpAssessment | StructuredSOAPNote;

// ---------------------------------------------------------------------------
// Drawing utility — quadratic curves for smooth ink
// ---------------------------------------------------------------------------

/**
 * Draws a stroke onto a canvas context using quadratic bezier curves.
 * CLINICAL: Smooth ink is important for legibility — jagged strokes can
 * misrepresent handwriting to the AI vision model.
 */
function drawStroke(ctx: CanvasRenderingContext2D, points: StrokePoint[], color: string, width: number): void {
  if (points.length === 0) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (points.length === 1) {
    // Single dot — draw a circle
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, width / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }

  // End at the last point
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Canvas background color — dark for maximum ink contrast
// ---------------------------------------------------------------------------

/** Dark canvas background. White ink on dark = maximum visibility for handwriting. */
const CANVAS_BG = '#1A1F2E';
/** White ink — maximum contrast on dark background */
const INK_COLOR = '#FFFFFF';
const INK_WIDTH = 2;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages scratchpad drawing, rendering, and submission state.
 *
 * @param canvasRef - Ref to the <canvas> DOM element
 * @param noteType - Determines which Claude Vision prompt and schema to use
 * @param patientContext - Patient context for accurate AI extraction
 * @param onSuccess - Called with the extracted note and captured strokes on success
 * @param initialStrokes - Pre-populate strokes (used when returning from review → edit)
 */
export function useScratchpad(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  noteType: 'initial' | 'followup' | 'soap',
  patientContext: ClinicalPatientContext,
  onSuccess: (note: ScratchpadNote, strokes: Stroke[]) => void,
  initialStrokes: Stroke[] = []
) {
  // React state — drives toolbar enabled/disabled state
  const [strokes, setStrokes] = useState<Stroke[]>(initialStrokes);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs — read directly in rAF loop without triggering re-renders
  const strokesRef = useRef<Stroke[]>(initialStrokes);
  const currentStrokeRef = useRef<StrokePoint[] | null>(null);
  const isDrawingRef = useRef(false);
  const rafRef = useRef<number>(0);

  // ---------------------------------------------------------------------------
  // rAF rendering loop — runs continuously while canvas is mounted
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.clientWidth || canvas.width;
      const h = canvas.clientHeight || canvas.height;

      // Fill dark background
      ctx.fillStyle = CANVAS_BG;
      ctx.fillRect(0, 0, w, h);

      // Draw all completed strokes
      for (const stroke of strokesRef.current) {
        drawStroke(ctx, stroke.points, stroke.color, stroke.width);
      }

      // Draw current in-progress stroke
      if (currentStrokeRef.current && currentStrokeRef.current.length > 0) {
        drawStroke(ctx, currentStrokeRef.current, INK_COLOR, INK_WIDTH);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  // canvasRef identity is stable — only run on mount/unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  // ---------------------------------------------------------------------------
  // Stroke handlers — pointer events call these from ScratchpadCanvas
  // ---------------------------------------------------------------------------

  const startStroke = useCallback((point: StrokePoint) => {
    isDrawingRef.current = true;
    currentStrokeRef.current = [point];
    setIsDrawing(true);
  }, []);

  const continueStroke = useCallback((point: StrokePoint) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    currentStrokeRef.current.push(point);
    // No React state update — rAF loop reads from ref directly
  }, []);

  const endStroke = useCallback(() => {
    if (!currentStrokeRef.current || currentStrokeRef.current.length === 0) {
      isDrawingRef.current = false;
      setIsDrawing(false);
      return;
    }

    const newStroke: Stroke = {
      points: [...currentStrokeRef.current],
      color: INK_COLOR,
      width: INK_WIDTH,
    };

    const updated = [...strokesRef.current, newStroke];
    strokesRef.current = updated;
    setStrokes(updated); // React update — enables Undo/Done toolbar buttons

    currentStrokeRef.current = null;
    isDrawingRef.current = false;
    setIsDrawing(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Editing operations
  // ---------------------------------------------------------------------------

  const undo = useCallback(() => {
    const updated = strokesRef.current.slice(0, -1);
    strokesRef.current = updated;
    setStrokes(updated);
  }, []);

  const clear = useCallback(() => {
    strokesRef.current = [];
    setStrokes([]);
  }, []);

  // ---------------------------------------------------------------------------
  // Capture and submit
  // ---------------------------------------------------------------------------

  /**
   * Captures the current canvas state as a base64 PNG data URL.
   * @returns Data URL string, or empty string if canvas is unavailable
   */
  const capture = useCallback((): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL('image/png');
  }, [canvasRef]);

  /**
   * Captures the scribble and submits it to the AI service for extraction.
   * @clinical-note The extracted note is a draft. Doctor confirms before saving.
   */
  const submit = useCallback(async () => {
    if (strokesRef.current.length === 0) {
      setError('Nothing scribbled yet. Add your clinical notes before submitting.');
      return;
    }

    const imageDataUrl = capture();
    if (!imageDataUrl) {
      setError('Could not capture your notes. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const note = await scratchpadService.processScribble(imageDataUrl, noteType, patientContext);
      onSuccess(note, [...strokesRef.current]);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : 'Could not read your notes. Check your connection and try again. Your scribble is preserved.';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  }, [capture, noteType, patientContext, onSuccess]);

  return {
    strokes,
    isDrawing,
    isProcessing,
    error,
    startStroke,
    continueStroke,
    endStroke,
    undo,
    clear,
    capture,
    submit,
    clearError: () => setError(null),
  };
}
