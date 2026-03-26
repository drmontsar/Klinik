import React from 'react';

/**
 * Orders screen — manages voice-commanded clinical orders
 * @param patientId - The patient for whom orders are being placed
 * @param onBack - Callback to return to the previous screen
 * @returns Voice orders interface with pending/confirmed order lists
 */
const OrdersScreen: React.FC<{
    patientId: string;
    onBack: () => void;
}> = ({ patientId: _patientId, onBack: _onBack }) => {
    // TODO: Compose VoiceOrders component
    return <div>OrdersScreen</div>;
};

export default OrdersScreen;
