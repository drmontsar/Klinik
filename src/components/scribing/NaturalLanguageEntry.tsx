import React, { useState, useRef } from 'react';
import { COLORS } from '../../constants/colors';
import ClinicalKeyboard from '../shared/ClinicalKeyboard';

/**
 * Natural Language to AI entry mode.
 * Doctor types a free-form consultation summary. Claude converts it to a
 * structured SOAP note. Same pipeline as voice scribing — just typed input.
 * @param onGenerate - Called with the typed text to trigger SOAP generation
 * @param isGenerating - True while Claude is processing
 * @param error - Generation error to display, if any
 */
interface NaturalLanguageEntryProps {
  onGenerate: (text: string) => void;
  isGenerating: boolean;
  error: string | null;
}

const EXAMPLE_PROMPT =
  `67M post-Whipple Day 2. Feeling slightly better today. Still some pain — 6/10. Afebrile overnight. T 37.4, HR 96, BP 112/70, SpO2 97% on air, RR 18. Abdomen soft, mild tenderness around wound. Drain output 120ml serous. Blood cultures pending. CRP trending down at 142.

Plan: repeat FBC and CRP tomorrow. Drain fluid amylase if drain output increases. Continue Pip-Tazo. Step down morphine PCA — start oral Paracetamol. Physio to review mobilisation. Review tomorrow morning.`;

const NaturalLanguageEntry: React.FC<NaturalLanguageEntryProps> = ({
  onGenerate,
  isGenerating,
  error,
}) => {
  const [text, setText] = useState('');
  const [showExample, setShowExample] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = (term: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? text.length;
    const next = text.slice(0, start) + term + text.slice(start);
    setText(next);
    setTimeout(() => el.setSelectionRange(start + term.length, start + term.length), 0);
  };

  const handleGenerate = () => {
    if (text.trim()) onGenerate(text.trim());
  };

  if (isGenerating) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🧠</div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.text, marginBottom: '6px' }}>
          Generating SOAP Note...
        </div>
        <div style={{ fontSize: '13px', color: COLORS.textMuted, marginBottom: '24px' }}>
          Claude is converting your text to a structured note
        </div>
        <div style={{ width: '240px', height: '4px', backgroundColor: COLORS.borderLight, borderRadius: '2px', margin: '0 auto', overflow: 'hidden' }}>
          <div style={{ height: '100%', backgroundColor: COLORS.brand, borderRadius: '2px', animation: 'klinik-progress 1.6s ease-in-out infinite' }} />
        </div>
        <style>{`@keyframes klinik-progress { 0%{width:15%;margin-left:0} 50%{width:60%;margin-left:20%} 100%{width:15%;margin-left:85%} }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Instruction card */}
      <div style={{ padding: '12px 16px', backgroundColor: COLORS.brandSubtle, borderRadius: '10px', border: `1px solid ${COLORS.brandBorder}` }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.brandDark, marginBottom: '4px' }}>
          Type naturally — Claude will structure it
        </div>
        <div style={{ fontSize: '12px', color: COLORS.textSecondary, lineHeight: '1.5' }}>
          Write how you'd dictate to a registrar: patient summary, vitals, findings, and plan. Mention numbers for vitals — Claude will extract them.
        </div>
        <button
          onClick={() => setShowExample(!showExample)}
          style={{ marginTop: '6px', fontSize: '12px', color: COLORS.brand, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
        >
          {showExample ? '▲ Hide example' : '▼ See example'}
        </button>
        {showExample && (
          <pre style={{ marginTop: '8px', fontSize: '12px', color: COLORS.textSecondary, whiteSpace: 'pre-wrap', lineHeight: '1.5', fontFamily: 'inherit', background: COLORS.surface, padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.borderLight}` }}>
            {EXAMPLE_PROMPT}
          </pre>
        )}
      </div>

      {/* Text input */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type your clinical note here..."
        rows={10}
        style={{
          width: '100%', padding: '12px 14px', border: `1px solid ${COLORS.borderLight}`,
          borderRadius: '12px', fontSize: '14px', lineHeight: '1.7',
          color: COLORS.text, fontFamily: 'inherit', resize: 'vertical',
          backgroundColor: COLORS.surface, boxSizing: 'border-box',
        }}
      />

      {/* Character count */}
      <div style={{ fontSize: '12px', color: COLORS.textDim, textAlign: 'right', marginTop: '-10px' }}>
        {text.length} characters
      </div>

      {/* Error state */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: COLORS.redBg, borderRadius: '10px', border: `1px solid ${COLORS.redBorder}`, fontSize: '13px', color: COLORS.red }}>
          ⚠️ {error}
        </div>
      )}

      {/* Clinical keyboard */}
      <ClinicalKeyboard onInsert={handleInsert} />

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!text.trim()}
        style={{
          padding: '13px 28px',
          backgroundColor: text.trim() ? COLORS.brand : COLORS.bgMuted,
          color: text.trim() ? COLORS.surface : COLORS.textDim,
          border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
          cursor: text.trim() ? 'pointer' : 'default', alignSelf: 'flex-end',
          transition: 'background-color 0.15s',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <span>🧠</span> Generate SOAP with AI
      </button>
    </div>
  );
};

export default NaturalLanguageEntry;
