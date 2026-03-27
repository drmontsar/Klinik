import React from 'react';
import { COLORS } from '../../constants/colors';

/**
 * Section header for SOAP template form panels.
 * Displays an icon and label with optional accent colour.
 * @param icon - Emoji or character shown before label
 * @param label - Section name (Subjective, Objective, Assessment, Plan)
 * @param color - Optional text color override, defaults to primary text
 */
const SectionHeader: React.FC<{ icon: string; label: string; color?: string }> = ({
  icon,
  label,
  color,
}) => (
  <div
    style={{
      fontSize: '14px',
      fontWeight: 700,
      color: color ?? COLORS.text,
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }}
  >
    <span>{icon}</span> {label}
  </div>
);

export default SectionHeader;
