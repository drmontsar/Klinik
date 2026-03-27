import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';
import type { VoiceOrder } from '../../types/clinical';

/**
 * Displays and manages a list of clinical orders awaiting confirmation.
 * Orders come from SOAP plan extraction or can be added manually.
 * @param orders - Pending and confirmed orders for this patient
 * @param onConfirm - Called with orderId when doctor confirms an order
 * @param onCancel - Called with orderId when doctor cancels an order
 * @param onAddManual - Called with new order text and type when doctor adds manually
 * @clinical-note All orders require explicit clinician confirmation before becoming active.
 * A confirmed order without doctor intent is a patient safety event.
 */
interface VoiceOrdersProps {
  orders: VoiceOrder[];
  onConfirm: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onAddManual: (orderText: string, orderType: VoiceOrder['orderType']) => void;
}

const ORDER_TYPE_CONFIG: Record<
  VoiceOrder['orderType'],
  { label: string; color: string; bgColor: string; icon: string }
> = {
  medication:    { label: 'Medication',    color: COLORS.red,    bgColor: COLORS.redBg,    icon: '💊' },
  investigation: { label: 'Investigation', color: COLORS.blue,   bgColor: COLORS.blueBg,   icon: '🔬' },
  nursing:       { label: 'Nursing',       color: COLORS.green,  bgColor: COLORS.greenBg,  icon: '🩺' },
  referral:      { label: 'Referral',      color: COLORS.purple, bgColor: COLORS.purpleBg, icon: '📋' },
  other:         { label: 'Other',         color: COLORS.amber,  bgColor: COLORS.amberBg,  icon: '📝' },
};

const ORDER_TYPES: VoiceOrder['orderType'][] = [
  'medication', 'investigation', 'nursing', 'referral', 'other',
];

const VoiceOrders: React.FC<VoiceOrdersProps> = ({
  orders,
  onConfirm,
  onCancel,
  onAddManual,
}) => {
  const [newOrderText, setNewOrderText] = useState('');
  const [newOrderType, setNewOrderType] = useState<VoiceOrder['orderType']>('medication');
  const [showAddForm, setShowAddForm] = useState(false);

  const pending = orders.filter(o => o.status === 'pending');
  const confirmed = orders.filter(o => o.status === 'confirmed');
  const cancelled = orders.filter(o => o.status === 'cancelled');

  const handleAddManual = () => {
    if (!newOrderText.trim()) return;
    onAddManual(newOrderText.trim(), newOrderType);
    setNewOrderText('');
    setShowAddForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Pending orders — require confirmation */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            Pending Confirmation
            {pending.length > 0 && (
              <span
                style={{
                  marginLeft: '8px',
                  fontSize: '13px',
                  backgroundColor: COLORS.amberBg,
                  color: COLORS.amber,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 600,
                }}
              >
                {pending.length}
              </span>
            )}
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '6px 14px',
              backgroundColor: showAddForm ? COLORS.bgMuted : COLORS.brand,
              color: showAddForm ? COLORS.textMuted : '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Order'}
          </button>
        </div>

        {/* Manual add form */}
        {showAddForm && (
          <div
            style={{
              padding: '16px',
              backgroundColor: COLORS.surface,
              borderRadius: '12px',
              border: `1px solid ${COLORS.brandBorder}`,
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {ORDER_TYPES.map(type => {
                const cfg = ORDER_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => setNewOrderType(type)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      border: `1px solid ${newOrderType === type ? cfg.color : COLORS.borderLight}`,
                      backgroundColor: newOrderType === type ? cfg.bgColor : COLORS.surface,
                      color: newOrderType === type ? cfg.color : COLORS.textMuted,
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: newOrderType === type ? 600 : 400,
                    }}
                  >
                    {cfg.icon} {cfg.label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newOrderText}
                onChange={e => setNewOrderText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddManual()}
                placeholder={`Enter ${ORDER_TYPE_CONFIG[newOrderType].label.toLowerCase()} order...`}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: `1px solid ${COLORS.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: COLORS.text,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAddManual}
                disabled={!newOrderText.trim()}
                style={{
                  padding: '10px 18px',
                  backgroundColor: newOrderText.trim() ? COLORS.brand : COLORS.borderLight,
                  color: newOrderText.trim() ? '#fff' : COLORS.textMuted,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: newOrderText.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {pending.length === 0 ? (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              color: COLORS.textDim,
              backgroundColor: COLORS.surface,
              borderRadius: '12px',
              border: `1px dashed ${COLORS.borderLight}`,
              fontSize: '14px',
            }}
          >
            No pending orders. Tap + Add Order to create one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pending.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onConfirm={() => onConfirm(order.id)}
                onCancel={() => onCancel(order.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Confirmed orders */}
      {confirmed.length > 0 && (
        <section>
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '15px',
              fontWeight: 700,
              color: COLORS.green,
            }}
          >
            ✓ Confirmed ({confirmed.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {confirmed.map(order => (
              <CompactOrderRow key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {/* Cancelled orders */}
      {cancelled.length > 0 && (
        <section>
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: 600,
              color: COLORS.textDim,
            }}
          >
            Cancelled ({cancelled.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {cancelled.map(order => (
              <CompactOrderRow key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────

interface OrderCardProps {
  order: VoiceOrder;
  onConfirm: () => void;
  onCancel: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onConfirm, onCancel }) => {
  const cfg = ORDER_TYPE_CONFIG[order.orderType];
  return (
    <div
      style={{
        padding: '14px 16px',
        backgroundColor: COLORS.surface,
        borderRadius: '12px',
        border: `1px solid ${COLORS.borderLight}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* Type badge */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: cfg.color,
          backgroundColor: cfg.bgColor,
          padding: '3px 8px',
          borderRadius: '10px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {cfg.icon} {cfg.label}
      </span>

      {/* Order text */}
      <span
        style={{
          flex: 1,
          fontSize: '14px',
          color: COLORS.text,
          lineHeight: '1.4',
        }}
      >
        {order.orderText}
      </span>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={onCancel}
          style={{
            padding: '7px 14px',
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.borderLight}`,
            borderRadius: '8px',
            cursor: 'pointer',
            color: COLORS.textMuted,
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          ✕
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: '7px 16px',
            backgroundColor: cfg.color,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

const CompactOrderRow: React.FC<{ order: VoiceOrder }> = ({ order }) => {
  const cfg = ORDER_TYPE_CONFIG[order.orderType];
  const isConfirmed = order.status === 'confirmed';
  return (
    <div
      style={{
        padding: '10px 14px',
        backgroundColor: isConfirmed ? COLORS.greenBg : COLORS.bgMuted,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        opacity: isConfirmed ? 1 : 0.6,
      }}
    >
      <span style={{ fontSize: '12px', color: cfg.color, fontWeight: 600 }}>
        {cfg.icon}
      </span>
      <span style={{ flex: 1, fontSize: '13px', color: isConfirmed ? COLORS.text : COLORS.textMuted }}>
        {order.orderText}
      </span>
      <span
        style={{
          fontSize: '11px',
          color: isConfirmed ? COLORS.green : COLORS.textDim,
          fontWeight: 600,
        }}
      >
        {isConfirmed ? '✓ Confirmed' : '✕ Cancelled'}
      </span>
    </div>
  );
};

export default VoiceOrders;
