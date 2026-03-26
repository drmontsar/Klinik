/**
 * Mock AI Provider — returns synthetic SOAP notes for development and testing.
 * No API calls, no API keys required.
 */

import type { SOAPNote } from '../../types/clinical';
import type { AIProvider } from '../aiProvider';

export class MockAIProvider implements AIProvider {
    readonly name = 'Mock (Development)';

    async generateSOAPNote(transcript: string, _patientContext: string): Promise<SOAPNote> {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Extract key phrases from transcript for realistic mock output
        const words = transcript.split(' ').slice(0, 10).join(' ');

        return {
            subjective: `Patient reports: "${words}..." (AI-generated from ${transcript.length} characters of transcript)`,
            objective: 'Vitals as per nursing observations. Patient examined — findings consistent with clinical context. No new acute findings on examination.',
            assessment: 'Clinical progress in line with expected post-operative course. Continue current management plan with close monitoring.',
            plan: '1. Continue current medications\n2. Monitor vitals 4-hourly\n3. Review bloods in AM\n4. Reassess on next ward round',
        };
    }
}
