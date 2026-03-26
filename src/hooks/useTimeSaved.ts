import { useState, useEffect } from 'react';

/**
 * Tracks estimated time saved by using AI scribing vs manual documentation
 * @returns Time saved in minutes, session count, and formatted display string
 */
const useTimeSaved = () => {
    // Determine initial state from localStorage if available
    const [totalMinutesSaved, setTotalMinutesSaved] = useState<number>(() => {
        const saved = localStorage.getItem('klinik_time_saved_minutes');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [sessionsCompleted, setSessionsCompleted] = useState<number>(() => {
        const saved = localStorage.getItem('klinik_sessions_completed');
        return saved ? parseInt(saved, 10) : 0;
    });

    // Update localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('klinik_time_saved_minutes', totalMinutesSaved.toString());
        localStorage.setItem('klinik_sessions_completed', sessionsCompleted.toString());
    }, [totalMinutesSaved, sessionsCompleted]);

    const addSessionTime = (minutes: number) => {
        setTotalMinutesSaved(prev => prev + minutes);
        setSessionsCompleted(prev => prev + 1);
    };

    const formatTime = (totalMin: number) => {
        if (totalMin < 60) return `${totalMin} min`;
        const hours = Math.floor(totalMin / 60);
        const mins = totalMin % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return {
        totalMinutesSaved,
        sessionsCompleted,
        formattedTimeSaved: formatTime(totalMinutesSaved),
        addSessionTime,
    };
};

export default useTimeSaved;
