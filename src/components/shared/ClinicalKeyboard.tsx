import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';

/**
 * Clinical keyboard — quick-tap tiles for common surgical oncology terms.
 * Reduces typing friction during ward rounds in Indian clinical context.
 * @param onInsert - Called with the term text when a tile is tapped
 */

interface ClinicalKeyboardProps {
  onInsert: (text: string) => void;
}

const CATEGORIES = [
  {
    label: 'Symptoms',
    color: COLORS.amber,
    bg: COLORS.amberBg,
    terms: [
      'Pain +', 'Nausea', 'Vomiting', 'Fever', 'Rigors',
      'Breathlessness', 'Constipation', 'Wound discharge',
      'Drain output ↑', 'Drain output ↓', 'Bleeding', 'Fatigue',
    ],
  },
  {
    label: 'Examination',
    color: COLORS.blue,
    bg: COLORS.blueBg,
    terms: [
      'NAD', 'Alert & oriented', 'Abdomen soft', 'Non-tender',
      'Guarding +', 'Bowel sounds +', 'Wound clean/dry/intact',
      'Drain insitu', 'Afebrile', 'Haemodynamically stable',
      'Maintaining sats on air', 'Chest clear',
    ],
  },
  {
    label: 'Investigations',
    color: COLORS.purple,
    bg: COLORS.purpleBg,
    terms: [
      'FBC + CRP', 'U/E + Creatinine', 'LFT', 'Blood cultures x2',
      'Serum amylase', 'Drain fluid amylase', 'Procalcitonin',
      'ABG', 'ECG', 'CXR', 'CT Abdomen', 'USG Abdomen',
    ],
  },
  {
    label: 'Medications',
    color: COLORS.red,
    bg: COLORS.redBg,
    terms: [
      'Inj. Pip-Tazo 4.5g IV Q8H', 'Inj. Metronidazole 500mg IV Q8H',
      'Inj. Ondansetron 4mg IV Q8H', 'Inj. Pantoprazole 40mg IV BD',
      'Inj. Enoxaparin 40mg SC OD', 'Tab. Paracetamol 1g PO Q6H',
      'IV Fluids NS @ 80ml/hr', 'Inj. Morphine PCA PRN',
    ],
  },
  {
    label: 'Assessment',
    color: COLORS.green,
    bg: COLORS.greenBg,
    terms: [
      'Improving', 'Stable — no change', 'Clinical deterioration',
      'For discharge today', 'For discharge tomorrow',
      'Query anastomotic leak', 'Surgical site infection',
      'Ileus', 'DVT', 'PE', 'Wound dehiscence', 'Post-op Day ',
    ],
  },
] as const;

const ClinicalKeyboard: React.FC<ClinicalKeyboardProps> = ({ onInsert }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const category = CATEGORIES[activeCategory];

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          backgroundColor: isOpen ? COLORS.brand : COLORS.surface,
          color: isOpen ? COLORS.surface : COLORS.brand,
          border: `1px solid ${COLORS.brandBorder}`,
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <span>⌨️</span>
        {isOpen ? 'Close Keyboard' : 'Clinical Keyboard'}
      </button>

      {/* Keyboard panel */}
      {isOpen && (
        <div
          style={{
            marginTop: '8px',
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.borderLight}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Category tabs */}
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              borderBottom: `1px solid ${COLORS.borderLight}`,
              backgroundColor: COLORS.bgSubtle,
              scrollbarWidth: 'none',
            }}
          >
            {CATEGORIES.map((cat, idx) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(idx)}
                style={{
                  flexShrink: 0,
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: activeCategory === idx ? cat.color : COLORS.textMuted,
                  backgroundColor:
                    activeCategory === idx ? COLORS.surface : 'transparent',
                  border: 'none',
                  borderBottom:
                    activeCategory === idx ? `2px solid ${cat.color}` : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Term chips */}
          <div style={{ padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {category.terms.map(term => (
              <button
                key={term}
                onClick={() => onInsert(term)}
                style={{
                  padding: '5px 12px',
                  backgroundColor: category.bg,
                  color: category.color,
                  border: `1px solid ${category.bg}`,
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'opacity 0.1s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.75'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalKeyboard;
