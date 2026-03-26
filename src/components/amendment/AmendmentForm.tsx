import React from 'react';

/**
 * Allows clinicians to amend previously approved clinical notes
 * @returns An amendment form showing original text, amendment field, and reason
 * @clinical-note Amendments are immutable audit entries — originals are never deleted
 */
const AmendmentForm: React.FC = () => {
    // CLINICAL: All amendments create a new audit record; originals are preserved
    // TODO: Implement amendment form with original text, edit field, and reason
    return <div>AmendmentForm</div>;
};

export default AmendmentForm;
