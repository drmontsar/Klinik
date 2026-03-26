import React from 'react';

/**
 * Amendment screen — allows clinicians to amend approved clinical notes
 * @param patientId - The patient whose note is being amended
 * @param noteId - The specific note being amended
 * @param onBack - Callback to return to the previous screen
 * @returns Amendment form with original text, edit field, reason, and submit
 */
const AmendmentScreen: React.FC<{
    patientId: string;
    noteId?: string;
    onBack: () => void;
}> = ({ patientId: _patientId, noteId: _noteId, onBack: _onBack }) => {
    // CLINICAL: All amendments create immutable audit records
    // TODO: Compose AmendmentScreen component
    return <div>AmendmentScreen</div>;
};

export default AmendmentScreen;
