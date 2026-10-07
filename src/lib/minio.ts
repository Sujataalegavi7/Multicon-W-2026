/**
 * Object-storage client — backed by SeaweedFS S3-compatible API.
 * All exported functions keep the same signatures as the previous MinIO
 * implementation so the rest of the codebase is unchanged.
 *
 * Required env vars:
 *   S3_ENDPOINT        e.g. http://localhost:8333
 *   S3_ACCESS_KEY_ID   e.g. admin
 *   S3_SECRET_ACCESS_KEY
 *   S3_BUCKET          e.g. my-pdfs
 *   S3_REGION          e.g. us-east-1  (default: us-east-1)
 */

import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import type { Readable } from "node:stream";
import { env } from "./env";

// ── singleton client (one per Node.js process) ────────────────────────────────
const g = globalThis as unknown as {
  _s3?: S3Client;
  _bucketReady?: Promise<void>;
};

function client(): S3Client {
  if (!g._s3) {
    g._s3 = new S3Client({
      endpoint: env("S3_ENDPOINT"),
      region: env("S3_REGION", "us-east-1"),
      forcePathStyle: true, // required for SeaweedFS / non-AWS endpoints
      credentials: {
        accessKeyId: env("S3_ACCESS_KEY_ID"),
        secretAccessKey: env("S3_SECRET_ACCESS_KEY"),
      },
    });
  }
  return g._s3;
}

const bucket = () => env("S3_BUCKET", "my-pdfs");

// ── bucket bootstrap ──────────────────────────────────────────────────────────
export function ensureBucket(): Promise<void> {
  if (!g._bucketReady) {
    g._bucketReady = (async () => {
      const c = client();
      const b = bucket();
      try {
        await c.send(new HeadBucketCommand({ Bucket: b }));
      } catch (err: unknown) {
        // Bucket doesn't exist yet — create it.
        const code = (err as { name?: string; $metadata?: { httpStatusCode?: number } });
        if (code.name === "NoSuchBucket" || code.$metadata?.httpStatusCode === 404) {
          await c.send(new CreateBucketCommand({ Bucket: b }));
        } else {
          throw err;
        }
      }
    })();
    g._bucketReady.catch(() => {
      g._bucketReady = undefined;
    });
  }
  return g._bucketReady;
}

// ── key helpers ───────────────────────────────────────────────────────────────
export function newKey(prefix: "pdfs" | "thumbs", ext: string) {
  return `${prefix}/${randomUUID()}.${ext}`;
}

// ── write ─────────────────────────────────────────────────────────────────────
export async function putFile(key: string, data: Buffer, contentType: string) {
  await ensureBucket();
  await client().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: data,
      ContentLength: data.length,
      ContentType: contentType,
    })
  );
}

// ── stat (size + metadata) ────────────────────────────────────────────────────
export async function statFile(key: string) {
  await ensureBucket();
  const res = await client().send(
    new HeadObjectCommand({ Bucket: bucket(), Key: key })
  );
  return {
    size: res.ContentLength ?? 0,
    metaData: res.Metadata ?? {},
    lastModified: res.LastModified,
    etag: res.ETag,
  };
}

// ── read (streaming, with optional byte-range) ────────────────────────────────
export async function getFileStream(
  key: string,
  range?: { offset: number; length: number }
): Promise<Readable> {
  await ensureBucket();
  const rangeHeader = range
    ? `bytes=${range.offset}-${range.offset + range.length - 1}`
    : undefined;
  const res = await client().send(
    new GetObjectCommand({
      Bucket: bucket(),
      Key: key,
      ...(rangeHeader ? { Range: rangeHeader } : {}),
    })
  );
  if (!res.Body) throw new Error(`Empty body for key: ${key}`);
  // AWS SDK v3 wraps the body in a ChecksumStream (not a standard web ReadableStream).
  // Piping through a PassThrough works regardless of the internal stream wrapper type.
  const pass = new (await import("node:stream")).PassThrough();
  (res.Body as NodeJS.ReadableStream).pipe(pass);
  return pass;
}

// ── delete ────────────────────────────────────────────────────────────────────
/** Best-effort delete: never throws, so DB operations aren't blocked by storage hiccups. */
export async function removeFiles(...keys: (string | null | undefined)[]) {
  const list = keys.filter((k): k is string => !!k);
  if (!list.length) return;
  try {
    await ensureBucket();
    await client().send(
      new DeleteObjectsCommand({
        Bucket: bucket(),
        Delete: {
          Objects: list.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    );
  } catch (err) {
    console.error("S3 cleanup failed for", list, err);
  }
}
