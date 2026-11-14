import { describe, expect, test } from 'bun:test';
import { detectAttachmentType } from '../src/services/chat_storage';

describe('chat attachment file signatures', () => {
  test('accepts only supported image and PDF signatures', () => {
    expect(detectAttachmentType(new TextEncoder().encode('%PDF-1.4\n'))).toBe('application/pdf');
    expect(detectAttachmentType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(detectAttachmentType(Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe('image/png');
    expect(detectAttachmentType(new TextEncoder().encode('RIFFxxxxWEBP'))).toBe('image/webp');
    expect(detectAttachmentType(new TextEncoder().encode('<script>alert(1)</script>'))).toBeNull();
    expect(detectAttachmentType(new TextEncoder().encode('%PDF'))).toBeNull();
  });
});
