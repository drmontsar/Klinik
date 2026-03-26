import React from 'react';

/**
 * Displays a persistent banner when the app is offline
 * @returns A top-of-screen warning bar indicating no network connectivity
 * @clinical-note Offline mode uses cached data — clinicians should verify data freshness
 */
const OfflineBanner: React.FC = () => {
    // CLINICAL: When offline, data may be stale — always verify critical values at bedside
    // TODO: Implement offline detection and banner display
    return <div>OfflineBanner</div>;
};

export default OfflineBanner;
