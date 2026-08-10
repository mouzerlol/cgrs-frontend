'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Star } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { ALLOWED_BLOG_IMAGE_TYPES, MAX_BLOG_IMAGE_BYTES } from '@/lib/api/blog';
import { useBlogAssetsQuery, useUploadBlogAsset } from '@/hooks/useBlogAdmin';
import { cn } from '@/lib/utils';
import type { BlogAsset } from '@/types/blog-admin';

/**
 * A post's imagery.
 *
 * Everything here lives in the private bucket. An image becomes public only if a
 * published body references it, and then under a content-hashed key the API
 * derives — so nothing an author uploads and then thinks better of is ever
 * reachable.
 *
 * Insert writes `asset:<id>` into the body, never a URL. References survive slug
 * and title changes because they encode no path, and a draft's images have no
 * public URL to leak.
 */

const sq = 'rounded-none';

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * A client-side check before the request goes out.
 *
 * Not a substitute for the server's — that is what actually enforces it, and it
 * is not bypassable. This only saves an author uploading ten megabytes to be
 * told no.
 */
function preCheck(file: File): string | null {
  if (file.size > MAX_BLOG_IMAGE_BYTES) {
    return `That image is ${humanSize(file.size)}. The limit is ${humanSize(MAX_BLOG_IMAGE_BYTES)}.`;
  }
  if (file.type && !ALLOWED_BLOG_IMAGE_TYPES.includes(file.type as never)) {
    return 'Only JPEG, PNG, and WebP images can be used.';
  }
  return null;
}

export default function AssetManager({
  postId,
  heroAssetId,
  onInsert,
  onSetHero,
}: {
  postId: string;
  heroAssetId: string | null;
  /** Writes the stable reference into the body at the cursor. */
  onInsert: (assetId: string, alt: string) => void;
  onSetHero: (assetId: string | null) => void;
}) {
  const { data: assets, isLoading } = useBlogAssetsQuery(postId);
  const upload = useUploadBlogAsset(postId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    const local = preCheck(file);
    if (local) {
      setError(local);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    try {
      await upload.mutateAsync(file);
    } catch (caught) {
      // The server's reason, verbatim — it knows things the browser does not,
      // such as whether the bytes are actually a readable image.
      setError(
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'The image could not be uploaded.',
      );
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className={cn(sq, 'border border-sage/30 bg-white')}>
      <div className="flex items-center justify-between border-b border-sage/30 bg-sage-light/40 px-4 py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-forest/50">Images</p>
        <label
          className={cn(
            sq,
            'inline-flex cursor-pointer items-center gap-1.5 bg-forest px-3 py-1.5 text-xs text-bone',
            upload.isPending && 'opacity-60',
          )}
        >
          {upload.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {upload.isPending ? 'Uploading…' : 'Upload'}
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            accept={ALLOWED_BLOG_IMAGE_TYPES.join(',')}
            disabled={upload.isPending}
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
      </div>

      {error && (
        <p className="border-b border-sage/30 px-4 py-2 text-xs text-terracotta-dark" role="alert">
          {error}
        </p>
      )}

      <div className="p-3">
        {isLoading ? (
          <p className="text-sm text-forest/40">Loading images…</p>
        ) : !assets || assets.length === 0 ? (
          <p className="text-sm text-forest/40">
            No images yet. Uploaded images stay private until a published post uses them.
          </p>
        ) : (
          <ul className="space-y-2">
            {assets.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                isHero={asset.id === heroAssetId}
                onInsert={onInsert}
                onSetHero={onSetHero}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function AssetRow({
  asset,
  isHero,
  onInsert,
  onSetHero,
}: {
  asset: BlogAsset;
  isHero: boolean;
  onInsert: (assetId: string, alt: string) => void;
  onSetHero: (assetId: string | null) => void;
}) {
  return (
    <li className={cn(sq, 'flex items-center gap-3 border border-sage/25 p-2')}>
      <div className="relative h-12 w-16 shrink-0 overflow-hidden bg-sage-light">
        {/* Unoptimised: the URL is a short-lived presigned link against the
            private bucket, so there is nothing stable for the optimiser to
            cache and its host is deliberately not in `remotePatterns`. */}
        <Image
          src={asset.url}
          alt=""
          fill
          unoptimized
          sizes="64px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-forest">{asset.filename}</p>
        <p className="font-mono text-[11px] text-forest/40">
          {asset.width}×{asset.height} · {humanSize(asset.sizeBytes)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onInsert(asset.id, asset.filename.replace(/\.[^.]+$/, ''))}
          className="text-xs text-forest/60 hover:text-terracotta"
        >
          Insert
        </button>
        <button
          type="button"
          onClick={() => onSetHero(isHero ? null : asset.id)}
          aria-pressed={isHero}
          className={cn(
            'inline-flex items-center gap-1 text-xs',
            isHero ? 'text-amber-dark' : 'text-forest/60 hover:text-terracotta',
          )}
        >
          <Star className={cn('h-3.5 w-3.5', isHero && 'fill-current')} aria-hidden="true" />
          {isHero ? 'Hero' : 'Set hero'}
        </button>
      </div>
    </li>
  );
}
