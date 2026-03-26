/**
 * Clinical data formatting utilities — pure functions, no state
 */

/**
 * Formats a date string into a human-readable clinical display format
 * @param dateString - ISO date string to format
 * @returns Formatted date e.g. "06 Mar 2026, 08:00"
 */
export const formatClinicalDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

/**
 * Formats a patient's age and sex for clinical display
 * @param age - Patient age in years
 * @param sex - Patient biological sex
 * @returns Formatted string e.g. "62M" or "55F"
 */
export const formatAgeSex = (age: number, sex: string): string => {
    const sexAbbrev = sex === 'Male' ? 'M' : sex === 'Female' ? 'F' : 'O';
    return `${age}${sexAbbrev}`;
};

/**
 * Formats a vital sign value with its unit
 * @param value - The numeric vital sign value
 * @param unit - The unit of measurement
 * @returns Formatted string e.g. "120 mmHg"
 */
export const formatVitalValue = (value: number, unit: string): string => {
    return `${value} ${unit}`;
};

/**
 * Truncates a clinical summary to a max length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum character length
 * @returns Truncated text with "..." if needed
 */
export const truncateSummary = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trimEnd()}...`;
};
