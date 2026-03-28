import React, { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../constants/colors';
import type { VoiceOrder } from '../types/clinical';
import type { Patient } from '../types/patient';
import VoiceOrders from '../components/orders/VoiceOrders';
import { createRepository } from '../services/createRepository';
import { getDoctorProfile } from '../services/doctorProfile';

/**
 * Orders screen — manages clinical orders for a patient.
 * Orders can be pre-populated from a SOAP note's plan or added manually.
 * @param patientId - The patient for whom orders are being placed
 * @param onBack - Callback to return to the previous screen
 * @param initialOrders - Optional orders pre-extracted from a SOAP note plan
 * @clinical-note All orders require explicit clinician confirmation before becoming active.
 */
const OrdersScreen: React.FC<{
  patientId: string;
  onBack: () => void;
  initialOrders?: Omit<VoiceOrder, 'id' | 'createdAt' | 'status'>[];
}> = ({ patientId, onBack, initialOrders = [] }) => {
  const repository = useMemo(() => createRepository(), []);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [orders, setOrders] = useState<VoiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Load patient and seed orders from initialOrders or recent SOAP plan
  useEffect(() => {
    repository
      .getPatientById(patientId)
      .then(p => {
        setPatient(p ?? null);
        // Seed orders from initialOrders prop
        if (initialOrders.length > 0) {
          const seeded: VoiceOrder[] = initialOrders.map((o, i) => ({
            ...o,
            id: `O-${Date.now()}-${i}`,
            createdAt: new Date().toISOString(),
            status: 'pending',
          }));
          setOrders(seeded);
        }
      })
      .finally(() => setLoading(false));
  }, [repository, patientId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = (orderId: string) => {
    // CLINICAL: Confirmation requires explicit doctor tap — no auto-confirm ever
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, status: 'confirmed', confirmedBy: getDoctorProfile()?.doctorName ?? 'Doctor' }
          : o
      )
    );
  };

  const handleCancel = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
  };

  const handleAddManual = (
    orderText: string,
    orderType: VoiceOrder['orderType']
  ) => {
    const newOrder: VoiceOrder = {
      id: `O-${Date.now()}`,
      patientId,
      orderText,
      orderType,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        minHeight: '100vh',
        backgroundColor: COLORS.bgSubtle,
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
          padding: '16px 24px',
          borderBottom: `1px solid ${COLORS.borderLight}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.textTertiary,
            fontSize: '15px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          ← Back
        </button>
        <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text }}>
          🗒️ Orders
        </div>
      </div>

      {/* Patient bar */}
      {patient && (
        <div
          style={{
            padding: '10px 24px',
            backgroundColor: COLORS.brandSubtle,
            borderBottom: `1px solid ${COLORS.brandBorder}`,
            fontSize: '14px',
          }}
        >
          <strong style={{ color: COLORS.text }}>{patient.name}</strong>
          <span style={{ color: COLORS.textMuted, marginLeft: '8px' }}>
            {patient.location} · {patient.diagnosis}
          </span>
        </div>
      )}

      {/* Stats bar */}
      {orders.length > 0 && (
        <div
          style={{
            padding: '10px 24px',
            backgroundColor: COLORS.surface,
            borderBottom: `1px solid ${COLORS.borderLight}`,
            display: 'flex',
            gap: '20px',
            fontSize: '13px',
          }}
        >
          <span style={{ color: COLORS.amber, fontWeight: 600 }}>
            {pendingCount} pending
          </span>
          <span style={{ color: COLORS.green, fontWeight: 600 }}>
            {confirmedCount} confirmed
          </span>
        </div>
      )}

      {/* Main content */}
      <div style={{ padding: '24px', maxWidth: '760px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: COLORS.textMuted }}>
            Loading...
          </div>
        ) : (
          <VoiceOrders
            orders={orders}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onAddManual={handleAddManual}
          />
        )}
      </div>

      {/* Sticky footer — done button when all orders resolved */}
      {orders.length > 0 && pendingCount === 0 && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            padding: '16px 24px',
            backgroundColor: COLORS.surface,
            borderTop: `1px solid ${COLORS.borderLight}`,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onBack}
            style={{
              padding: '12px 32px',
              backgroundColor: COLORS.green,
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(22,163,74,0.3)',
            }}
          >
            ✓ All Orders Resolved — Done
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersScreen;
