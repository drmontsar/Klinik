import React from 'react';
import { COLORS } from '../../constants/colors';

/**
 * Horizontal scrollable chip strip showing clinical term suggestions.
 * Appears inline below the focused field — no separate keyboard button.
 * Uses onMouseDown + preventDefault to prevent field blur before selection.
 *
 * @param suggestions - Ordered list of terms to display (max 10)
 * @param onSelect - Called with the selected term string
 * @param visible - Whether the strip is shown (controls height/opacity)
 * @param color - Text/border color for chips (matches field category color)
 * @param bg - Background color for chips (matches field category)
 */
interface SuggestionStripProps {
  suggestions: string[];
  onSelect: (term: string) => void;
  visible: boolean;
  color?: string;
  bg?: string;
}

const SuggestionStrip: React.FC<SuggestionStripProps> = ({
  suggestions,
  onSelect,
  visible,
  color = COLORS.brand,
  bg = COLORS.card,
}) => {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        padding: '6px 0 2px',
        // Hide scrollbar visually but keep scroll functional
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      aria-label="Clinical term suggestions"
    >
      {suggestions.map(term => (
        <button
          key={term}
          // CLINICAL: onMouseDown + preventDefault prevents the textarea/input
          // from losing focus before the click fires. Without this, onBlur fires
          // first and the strip disappears before the tap registers.
          onMouseDown={e => {
            e.preventDefault();
            onSelect(term);
          }}
          style={{
            flexShrink: 0,
            padding: '4px 10px',
            backgroundColor: bg,
            color,
            border: `1px solid ${color}`,
            borderRadius: '14px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.1s',
          }}
        >
          {term}
        </button>
      ))}
    </div>
  );
};

export default SuggestionStrip;
