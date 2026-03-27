import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';
import SuggestionStrip from '../shared/SuggestionStrip';
import useClinicalSuggestions from '../../hooks/useClinicalSuggestions';
import type { SuggestionCategory } from '../../hooks/useClinicalSuggestions';

/**
 * Tag-input for a single plan section (investigations, medications, etc.)
 * with inline clinical term suggestions.
 * Press Enter or comma to add an item. Backspace on empty draft removes last tag.
 * Suggestions appear as a chip strip below the input when focused,
 * filtered by current draft text. Selecting a suggestion commits it as a tag.
 *
 * @param items - Current list of plan item strings
 * @param onChange - Called with updated list when items change
 * @param color - Text/tag color for this plan category
 * @param bg - Background color for this plan category
 * @param placeholder - Input placeholder shown when list is empty
 * @param category - Suggestion category for inline term chips
 * @param inputRef - Optional ref for programmatic focus
 */
interface PlanTagInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  color: string;
  bg: string;
  placeholder: string;
  category?: SuggestionCategory;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const PlanTagInput: React.FC<PlanTagInputProps> = ({
  items,
  onChange,
  color,
  bg,
  placeholder,
  category,
  inputRef,
}) => {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const { getSuggestions, recordUsage } = useClinicalSuggestions();

  const commit = (text?: string) => {
    const trimmed = (text ?? draft).trim();
    if (trimmed) {
      onChange([...items, trimmed]);
      if (category) recordUsage(category, trimmed);
    }
    setDraft('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
    if (e.key === 'Backspace' && !draft && items.length) {
      onChange(items.slice(0, -1));
    }
  };

  const handleSuggestionSelect = (term: string) => {
    commit(term);
    inputRef?.current?.focus();
  };

  const suggestions = focused && category ? getSuggestions(category, draft) : [];

  return (
    <div>
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', gap: '6px',
          padding: '8px 10px', border: `1px solid ${COLORS.borderLight}`,
          borderRadius: '10px', backgroundColor: COLORS.surface,
          minHeight: '44px', alignItems: 'center', cursor: 'text',
        }}
        onClick={() => inputRef?.current?.focus()}
      >
        {items.map((item, i) => (
          <span
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '3px 10px', backgroundColor: bg, color,
              borderRadius: '12px', fontSize: '13px', fontWeight: 500,
            }}
          >
            {item}
            <button
              onClick={e => { e.stopPropagation(); onChange(items.filter((_, j) => j !== i)); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color, fontSize: '14px', lineHeight: 1, padding: 0 }}
            >×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); commit(); }}
          placeholder={items.length === 0 ? placeholder : ''}
          style={{
            border: 'none', outline: 'none', fontSize: '13px',
            color: COLORS.text, flex: 1, minWidth: '120px',
            backgroundColor: 'transparent',
          }}
        />
      </div>
      {category && (
        <SuggestionStrip
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          visible={focused}
          color={color}
          bg={bg}
        />
      )}
    </div>
  );
};

export default PlanTagInput;
