import React, { useEffect, useRef } from 'react';
import { COLORS } from '../../constants/colors';

/**
 * Renders a real-time audio waveform visualisation during recording.
 * Uses the AnalyserNode from useAudioCapture for real audio data when available,
 * falls back to animated sine wave when no analyser is provided.
 * @param analyserNode - Optional AnalyserNode from WebAudio for real waveform data
 * @clinical-note Visual feedback confirms microphone is actively capturing
 */
const WaveformDisplay: React.FC<{ analyserNode?: AnalyserNode | null }> = ({ analyserNode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let phase = 0;
        const dataArray = analyserNode ? new Uint8Array(analyserNode.frequencyBinCount) : null;

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            ctx.beginPath();
            ctx.moveTo(0, height / 2);

            if (analyserNode && dataArray) {
                // Real waveform from microphone
                analyserNode.getByteTimeDomainData(dataArray);
                const sliceWidth = width / dataArray.length;
                let x = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const v = dataArray[i] / 128.0;
                    const y = (v * height) / 2;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                    x += sliceWidth;
                }
            } else {
                // Animated sine wave fallback
                for (let i = 0; i < width; i += 2) {
                    const amplitude = 15 + Math.sin(phase * 0.5) * 10;
                    const y = height / 2 + Math.sin(i * 0.05 + phase) * amplitude;
                    ctx.lineTo(i, y);
                }
                phase += 0.1;
            }

            ctx.strokeStyle = COLORS.brand;
            ctx.lineWidth = 2;
            ctx.stroke();

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationFrameId);
    }, [analyserNode]);

    return (
        <div style={{ padding: '16px', backgroundColor: COLORS.brandSubtle, borderRadius: '8px', border: `1px solid ${COLORS.brandBorder}` }}>
            <div style={{ fontSize: '12px', color: COLORS.brand, fontWeight: 600, marginBottom: '8px' }}>
                AUDIO INPUT {analyserNode ? 'ACTIVE' : 'STANDBY'}
            </div>
            <canvas
                ref={canvasRef}
                width={600}
                height={60}
                style={{ width: '100%', height: '60px', borderRadius: '4px', backgroundColor: COLORS.surface }}
            />
        </div>
    );
};

export default WaveformDisplay;
