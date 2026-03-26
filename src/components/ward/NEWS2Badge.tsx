import React from 'react';
import { getNews2ResponseLevel } from '../../utils/calculateNEWS2';

/**
 * Displays a NEWS2 score badge with color-coded risk level
 * @param score - The NEWS2 aggregate score
 * @returns A badge component with appropriate color and label
 * @clinical-note Colors follow NEWS2 clinical escalation: green (low), amber (medium), red (high)
 */
const NEWS2Badge: React.FC<{ score: number }> = ({ score }) => {
    const responseLevel = getNews2ResponseLevel(score);

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: responseLevel.bgColor,
            color: responseLevel.color,
            fontWeight: 600,
            fontSize: '14px',
            border: `1px solid ${responseLevel.color}`,
        }}>
            NEWS2: {score}
        </div>
    );
};

export default NEWS2Badge;
