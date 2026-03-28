/**
 * NoteTypeSelector — renders three note type option cards.
 * Pure UI component: no navigation logic, no business logic.
 * The parent screen handles selection and navigation.
 */

import React from 'react';
import { COLORS } from '../../constants/colors';

export type NoteType = 'initial' | 'followup' | 'soap';

interface NoteTypeOption {
  type: NoteType;
  icon: string;
  label: string;
  description: string;
}

const NOTE_TYPE_OPTIONS: NoteTypeOption[] = [
  {
    type: 'initial',
    icon: '📋',
    label: 'Initial Assessment',
    description: 'New patient — first visit',
  },
  {
    type: 'followup',
    icon: '🔄',
    label: 'Follow Up',
    description: 'Returning patient',
  },
  {
    type: 'soap',
    icon: '🏥',
    label: 'SOAP Note',
    description: 'IP ward round',
  },
];

interface NoteTypeSelectorProps {
  selectedType: NoteType | null;
  onSelect: (type: NoteType) => void;
}

const NoteTypeSelector: React.FC<NoteTypeSelectorProps> = ({ selectedType, onSelect }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {NOTE_TYPE_OPTIONS.map(option => {
        const isSelected = selectedType === option.type;
        return (
          <button
            key={option.type}
            onClick={() => onSelect(option.type)}
            style={{
              width: '100%',
              padding: '20px',
              backgroundColor: isSelected ? COLORS.brandSubtle : COLORS.surface,
              border: `2px solid ${isSelected ? COLORS.brand : COLORS.borderLight}`,
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'left',
              transition: 'border-color 0.15s, background-color 0.15s',
            }}
          >
            <span style={{ fontSize: '28px', flexShrink: 0 }}>{option.icon}</span>
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: isSelected ? COLORS.brand : COLORS.text,
                marginBottom: '2px',
              }}>
                {option.label}
              </div>
              <div style={{ fontSize: '13px', color: COLORS.textMuted }}>
                {option.description}
              </div>
            </div>
            {isSelected && (
              <div style={{
                marginLeft: 'auto',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: COLORS.brand,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: COLORS.surface, fontSize: '13px', fontWeight: 700 }}>✓</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default NoteTypeSelector;
