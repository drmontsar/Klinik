import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import '../config'; // Load the same .env as the database before reading S3 settings.

const bucket = process.env.S3_BUCKET;
const endpoint = process.env.S3_ENDPOINT;
const client = new S3Client({
  region: process.env.S3_REGION ?? 'us-east-1',
  endpoint: endpoint || undefined,
  forcePathStyle: Boolean(endpoint),
  credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
    ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY }
    : undefined,
});

export function storageReady() { return Boolean(bucket); }

export async function putAttachment(key: string, contentType: string, body: Uint8Array) {
  if (!bucket) throw new Error('S3_BUCKET is not set');
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
}

export async function getAttachment(key: string) {
  if (!bucket) throw new Error('S3_BUCKET is not set');
  const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!result.Body) throw new Error('Attachment has no body');
  return result.Body.transformToByteArray();
}

export async function deleteAttachment(key: string) {
  if (!bucket) return;
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export function detectAttachmentType(bytes: Uint8Array): string | null {
  if (bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-') return 'application/pdf';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)) return 'image/png';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  return null;
}
