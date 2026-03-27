import React, { useState, useRef } from 'react';
import { COLORS } from '../../constants/colors';
import SuggestionStrip from '../shared/SuggestionStrip';
import useClinicalSuggestions from '../../hooks/useClinicalSuggestions';
import type { SuggestionCategory } from '../../hooks/useClinicalSuggestions';

/**
 * Form field (input or textarea) with an inline clinical suggestion strip.
 * The strip appears on focus and filters as the user types.
 * Selecting a suggestion inserts it at the cursor and records usage.
 *
 * @param label - Field label shown above the input
 * @param value - Controlled value
 * @param onChange - Value change handler
 * @param category - Suggestion category — drives which terms are shown
 * @param multiline - If true, renders a textarea; otherwise an input
 * @param rows - Number of rows for textarea (default 2)
 * @param placeholder - Input placeholder
 * @param type - Input type attribute (default 'text')
 * @param style - Additional style overrides for the field
 * @param color - Chip accent color (defaults to brand blue)
 * @param bg - Chip background color
 * @clinical-note Each field is self-contained — it owns its own focus state
 * and manages the suggestion strip lifecycle independently.
 */
interface TemplateFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  category: SuggestionCategory;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  type?: string;
  style?: React.CSSProperties;
  color?: string;
  bg?: string;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
}

const baseFieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: `1px solid ${COLORS.borderLight}`,
  borderRadius: '8px',
  fontSize: '14px',
  color: COLORS.text,
  backgroundColor: COLORS.surface,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const TemplateField: React.FC<TemplateFieldProps> = ({
  label,
  value,
  onChange,
  category,
  multiline = false,
  rows = 2,
  placeholder,
  type = 'text',
  style,
  color = COLORS.brand,
  bg = COLORS.card,
  inputRef,
}) => {
  const [focused, setFocused] = useState(false);
  const internalRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const ref = (inputRef ?? internalRef) as React.RefObject<HTMLInputElement & HTMLTextAreaElement>;
  const { getSuggestions, recordUsage } = useClinicalSuggestions();

  const suggestions = focused ? getSuggestions(category, value) : [];

  const handleSelect = (term: string) => {
    // Insert at cursor position if available, otherwise append
    const el = ref.current;
    if (el && 'selectionStart' in el) {
      const start = el.selectionStart ?? value.length;
      const end = el.selectionEnd ?? start;
      const next = value.slice(0, start) + term + value.slice(end);
      onChange(next);
      setTimeout(() => el.setSelectionRange(start + term.length, start + term.length), 0);
    } else {
      onChange(value ? value + ' ' + term : term);
    }
    recordUsage(category, term);
  };

  const fieldStyle = { ...baseFieldStyle, ...(multiline ? { resize: 'vertical' as const, lineHeight: '1.6', minHeight: '80px' } : {}), ...style };

  return (
    <div>
      <label style={{ fontSize: '12px', color: COLORS.textMuted, display: 'block', marginBottom: '4px' }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={rows}
          style={fieldStyle}
        />
      ) : (
        <input
          ref={ref as React.RefObject<HTMLInputElement>}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={fieldStyle}
        />
      )}
      <SuggestionStrip
        suggestions={suggestions}
        onSelect={handleSelect}
        visible={focused}
        color={color}
        bg={bg}
      />
    </div>
  );
};

export default TemplateField;
