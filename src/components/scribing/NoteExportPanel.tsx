import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';
import {
    formatNoteAsText,
    copyToClipboard,
    shareNote,
    downloadNoteAsText,
    type NoteExportData,
} from '../../utils/exportSOAPNote';

/**
 * Note export panel — shown after the doctor signs a SOAP note.
 * Gives three ways to get the note into an existing hospital EMR
 * without requiring any IT integration:
 *
 *   1. Copy — paste into any EMR text field
 *   2. Share — WhatsApp / email / any installed app (Web Share API)
 *   3. Download — .txt file to email or attach to record
 *
 * @param noteData - The signed note content and patient identifiers
 * @param onDone - Called when the doctor taps "Done" to return to patient
 */
interface NoteExportPanelProps {
    noteData: NoteExportData;
    onDone: () => void;
}

type ExportStatus = 'idle' | 'success' | 'error';

const NoteExportPanel: React.FC<NoteExportPanelProps> = ({ noteData, onDone }) => {
    const [copyStatus, setCopyStatus] = useState<ExportStatus>('idle');
    const [shareStatus, setShareStatus] = useState<ExportStatus>('idle');
    const [downloadStatus, setDownloadStatus] = useState<ExportStatus>('idle');

    // Pre-format once — all three export actions use the same text
    const formattedText = formatNoteAsText(noteData);

    const canShare = typeof navigator !== 'undefined' && !!navigator.share;

    const handleCopy = async () => {
        const ok = await copyToClipboard(formattedText);
        setCopyStatus(ok ? 'success' : 'error');
        if (ok) setTimeout(() => setCopyStatus('idle'), 3000);
    };

    const handleShare = async () => {
        const ok = await shareNote(formattedText, noteData.patientName);
        setShareStatus(ok ? 'success' : 'error');
        if (ok) setTimeout(() => setShareStatus('idle'), 3000);
    };

    const handleDownload = () => {
        downloadNoteAsText(formattedText, noteData.patientName, noteData.signedAt);
        setDownloadStatus('success');
        setTimeout(() => setDownloadStatus('idle'), 3000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Success banner */}
            <div style={{
                padding: '16px',
                backgroundColor: COLORS.greenBg,
                borderRadius: '12px',
                border: `1px solid ${COLORS.green}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                <span style={{ fontSize: '24px' }}>✓</span>
                <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: COLORS.green }}>
                        Note signed and saved
                    </div>
                    <div style={{ fontSize: '13px', color: COLORS.textSecondary, marginTop: '2px' }}>
                        {noteData.patientName} — {noteData.diagnosis}
                    </div>
                </div>
            </div>

            {/* Export to EMR section */}
            <div style={{
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.borderLight}`,
                borderRadius: '12px',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '12px 16px',
                    borderBottom: `1px solid ${COLORS.borderLight}`,
                    backgroundColor: COLORS.bgSubtle,
                }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: COLORS.text }}>
                        Send note to your hospital EMR
                    </div>
                    <div style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '2px' }}>
                        No API needed — copy, share, or download and paste into your existing system
                    </div>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                    {/* Copy to Clipboard */}
                    <ExportButton
                        icon="📋"
                        label="Copy to Clipboard"
                        description="Paste directly into any EMR text field"
                        status={copyStatus}
                        successLabel="Copied!"
                        errorLabel="Copy failed — try again"
                        color={COLORS.brand}
                        bgColor={COLORS.brandSubtle}
                        borderColor={COLORS.brandBorder}
                        onClick={handleCopy}
                    />

                    {/* Share (WhatsApp / Email / etc.) */}
                    <ExportButton
                        icon="↗"
                        label={canShare ? 'Share (WhatsApp / Email / ...)' : 'Share — copy to clipboard'}
                        description={
                            canShare
                                ? 'Opens your device share sheet — WhatsApp, email, any app'
                                : 'Share not available on this browser — copies to clipboard instead'
                        }
                        status={shareStatus}
                        successLabel="Shared!"
                        errorLabel="Share cancelled"
                        color={COLORS.blue}
                        bgColor={COLORS.blueBg}
                        borderColor={COLORS.blueBorder}
                        onClick={handleShare}
                    />

                    {/* Download as .txt */}
                    <ExportButton
                        icon="⬇"
                        label="Download as text file"
                        description="Saves to Downloads — email or attach to patient record"
                        status={downloadStatus}
                        successLabel="Downloaded!"
                        errorLabel="Download failed"
                        color={COLORS.purple}
                        bgColor={COLORS.purpleLight}
                        borderColor={COLORS.purpleBorder}
                        onClick={handleDownload}
                    />
                </div>
            </div>

            {/* Note preview — collapsed by default, expandable */}
            <NotePreview text={formattedText} />

            {/* Done button */}
            <button
                onClick={onDone}
                style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: COLORS.brand,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: `0 2px 8px ${COLORS.brandShadow}`,
                }}
            >
                Done — Back to Patient
            </button>

        </div>
    );
};

// ── Sub-components ─────────────────────────────────────────────────────────

interface ExportButtonProps {
    icon: string;
    label: string;
    description: string;
    status: ExportStatus;
    successLabel: string;
    errorLabel: string;
    color: string;
    bgColor: string;
    borderColor: string;
    onClick: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
    icon, label, description, status, successLabel, errorLabel,
    color, bgColor, borderColor, onClick,
}) => {
    const isSuccess = status === 'success';
    const isError = status === 'error';

    return (
        <button
            onClick={onClick}
            style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: isSuccess ? COLORS.greenBg : bgColor,
                border: `1px solid ${isSuccess ? COLORS.green : isError ? COLORS.redBorder : borderColor}`,
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                transition: 'all 0.15s',
            }}
        >
            <span style={{
                fontSize: '20px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSuccess ? COLORS.green : color,
                color: '#fff',
                borderRadius: '8px',
                flexShrink: 0,
                fontStyle: 'normal',
            }}>
                {isSuccess ? '✓' : icon}
            </span>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isSuccess ? COLORS.green : isError ? COLORS.red : COLORS.text,
                }}>
                    {isSuccess ? successLabel : isError ? errorLabel : label}
                </div>
                {!isSuccess && !isError && (
                    <div style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '1px' }}>
                        {description}
                    </div>
                )}
            </div>
        </button>
    );
};

const NotePreview: React.FC<{ text: string }> = ({ text }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.borderLight}`,
            borderRadius: '12px',
            overflow: 'hidden',
        }}>
            <button
                onClick={() => setExpanded(e => !e)}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                    color: COLORS.textMuted,
                    fontWeight: 500,
                }}
            >
                <span>Preview formatted note</span>
                <span>{expanded ? '▲' : '▼'}</span>
            </button>
            {expanded && (
                <pre style={{
                    margin: 0,
                    padding: '0 16px 16px',
                    fontSize: '12px',
                    lineHeight: '1.7',
                    color: COLORS.textSecondary,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    borderTop: `1px solid ${COLORS.borderLight}`,
                    paddingTop: '12px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                }}>
                    {text}
                </pre>
            )}
        </div>
    );
};

export default NoteExportPanel;
