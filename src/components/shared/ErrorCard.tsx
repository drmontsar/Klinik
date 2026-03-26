import React from 'react';

/**
 * Displays a user-friendly error state with retry option
 * @param message - The error message to display
 * @param onRetry - Optional callback to retry the failed operation
 * @returns A styled error card with message and retry button
 */
const ErrorCard: React.FC<{ message: string; onRetry?: () => void }> = ({
    message: _message,
    onRetry: _onRetry,
}) => {
    // TODO: Implement error card with retry capability
    return <div>ErrorCard</div>;
};

export default ErrorCard;
