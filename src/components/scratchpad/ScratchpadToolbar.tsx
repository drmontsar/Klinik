/**
 * ScratchpadToolbar — fixed bottom bar with Undo, Clear, and Done controls.
 * Clear uses inline confirmation — no browser confirm() dialog.
 */

import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';

interface ScratchpadToolbarProps {
  strokeCount: number;
  isProcessing: boolean;
  onUndo: () => void;
  onClear: () => void;
  onDone: () => void;
}

const ScratchpadToolbar: React.FC<ScratchpadToolbarProps> = ({
  strokeCount,
  isProcessing,
  onUndo,
  onClear,
  onDone,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearRequest = () => {
    if (strokeCount === 0) return;
    setShowClearConfirm(true);
  };

  const handleClearConfirm = () => {
    onClear();
    setShowClearConfirm(false);
  };

  const handleClearCancel = () => {
    setShowClearConfirm(false);
  };

  const canUndo = strokeCount > 0 && !isProcessing;
  const canClear = strokeCount > 0 && !isProcessing;
  const canDone = strokeCount > 0 && !isProcessing;

  const buttonBase: React.CSSProperties = {
    height: '40px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'opacity 0.15s',
    fontFamily: 'inherit',
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: 'rgba(17, 24, 39, 0.92)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 10,
    }}>

      {/* Undo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        style={{
          ...buttonBase,
          width: '44px',
          backgroundColor: canUndo ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
          color: canUndo ? '#E8EDF5' : '#4B5563',
        }}
        title="Undo last stroke"
      >
        ↩
      </button>

      {/* Clear / inline confirm */}
      {showClearConfirm ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '13px', color: '#E8EDF5', whiteSpace: 'nowrap' }}>Clear all?</span>
          <button
            onClick={handleClearConfirm}
            style={{
              ...buttonBase,
              padding: '0 14px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
            }}
          >
            Yes
          </button>
          <button
            onClick={handleClearCancel}
            style={{
              ...buttonBase,
              padding: '0 14px',
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#E8EDF5',
            }}
          >
            No
          </button>
          {/* Spacer pushes Done to right */}
          <div style={{ flex: 1 }} />
        </div>
      ) : (
        <>
          {/* Clear */}
          <button
            onClick={handleClearRequest}
            disabled={!canClear}
            style={{
              ...buttonBase,
              padding: '0 14px',
              backgroundColor: canClear ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
              color: canClear ? '#E8EDF5' : '#4B5563',
            }}
          >
            Clear
          </button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />
        </>
      )}

      {/* Done */}
      <button
        onClick={onDone}
        disabled={!canDone}
        style={{
          ...buttonBase,
          padding: '0 20px',
          minWidth: '100px',
          backgroundColor: canDone ? COLORS.brand : 'rgba(255,255,255,0.06)',
          color: canDone ? '#FFFFFF' : '#4B5563',
          fontWeight: 600,
          fontSize: '15px',
        }}
      >
        {isProcessing ? (
          <>
            <span style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#FFFFFF',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            Processing...
          </>
        ) : (
          <>Done →</>
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ScratchpadToolbar;
