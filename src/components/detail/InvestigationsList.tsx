import React from 'react';
import type { Investigation } from '../../types/patient';
import { COLORS } from '../../constants/colors';
import { formatClinicalDate } from '../../utils/formatClinical';

/**
 * Displays recent investigation/lab results for a patient
 * @param investigations - Array of investigation results
 * @returns A table of results with abnormal values highlighted
 * @clinical-note Abnormal results are shown in red with the normal range for comparison
 */
const InvestigationsList: React.FC<{ investigations: Investigation[] }> = ({ investigations }) => {
    return (
        <div style={{ padding: '20px', backgroundColor: COLORS.surface, borderRadius: '12px', border: `1px solid ${COLORS.borderLight}`, marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: COLORS.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🔬</span> Labs & Investigations
            </h3>
            {(!investigations || investigations.length === 0) ? (
                <div style={{ color: COLORS.textMuted, fontSize: '14px', fontStyle: 'italic' }}>No investigations available.</div>
            ) : (
                <div style={{
                    border: `1px solid ${COLORS.borderLight}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    fontFamily: 'system-ui, sans-serif'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: COLORS.bgSubtle, borderBottom: `1px solid ${COLORS.borderLight}` }}>
                            <tr>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: COLORS.textSecondary }}>Test</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: COLORS.textSecondary }}>Result</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: COLORS.textSecondary }}>Reported</th>
                            </tr>
                        </thead>
                        <tbody style={{ backgroundColor: COLORS.surface }}>
                            {investigations.map((inv, idx) => (
                                <tr key={inv.id} style={{ borderBottom: idx === investigations.length - 1 ? 'none' : `1px solid ${COLORS.borderLight}` }}>
                                    <td style={{ padding: '12px 16px', color: COLORS.text, fontWeight: 500 }}>{inv.testName}</td>
                                    <td style={{ padding: '12px 16px', color: inv.isAbnormal ? COLORS.red : COLORS.text, fontWeight: inv.isAbnormal ? 600 : 400 }}>
                                        {inv.value} {inv.unit} {inv.isAbnormal && '⚠️'}
                                        <div style={{ fontSize: '12px', color: COLORS.textMuted, fontWeight: 400, marginTop: '2px' }}>
                                            Ref: {inv.normalRange}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px', color: COLORS.textMuted }}>
                                        {formatClinicalDate(inv.reportedAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InvestigationsList;
