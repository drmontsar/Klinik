import React from 'react';
import { COLORS } from '../../constants/colors';

/**
 * Displays the active problems list for a patient
 * @param problems - Array of problem description strings
 * @returns A numbered list of active clinical problems
 * @clinical-note Problems should be displayed in clinical priority order
 */
const ProblemsList: React.FC<{ problems: string[] }> = ({ problems }) => {
    return (
        <div style={{ padding: '20px', backgroundColor: COLORS.surface, borderRadius: '12px', border: `1px solid ${COLORS.borderLight}`, marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: COLORS.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span> Active Problems
            </h3>
            {problems.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '24px', color: COLORS.textSecondary, fontSize: '15px', lineHeight: '1.6' }}>
                    {problems.map((prob, idx) => (
                        <li key={idx} style={{ marginBottom: '8px' }}>{prob}</li>
                    ))}
                </ul>
            ) : (
                <p style={{ margin: 0, color: COLORS.textMuted, fontStyle: 'italic', fontSize: '14px' }}>No active problems noted.</p>
            )}
        </div>
    );
};

export default ProblemsList;
