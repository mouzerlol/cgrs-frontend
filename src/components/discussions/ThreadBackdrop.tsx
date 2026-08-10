import Image from 'next/image';
import { cn } from '@/lib/utils';

/** The image the discussion section used to run as a full page hero. */
export const THREAD_BACKDROP_IMAGE = '/images/mangere-mountain.jpg';

interface ThreadBackdropProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Mounts the thread card on the discussion section's photograph.
 *
 * The image is the wrapper's own background rather than a fixed-height band, so it
 * always ends up exactly as tall as whatever it contains plus the padding below —
 * a band cropped partway down the card reads as a broken image, not a mount.
 *
 * Full-bleed on purpose: the padding is on this element, the container query lives
 * on the child, so the photograph runs edge to edge behind a centred card.
 */
export default function ThreadBackdrop({ children, className }: ThreadBackdropProps) {
  return (
    <div className={cn('relative px-4 pb-12 pt-14 md:pb-16 md:pt-20', className)}>
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <Image
          src={THREAD_BACKDROP_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Enough forest to keep the card's own shadow readable against foliage. */}
        <div className="absolute inset-0 bg-forest/35" />
      </div>

      <div className="container relative z-10 mx-auto max-w-4xl px-0">{children}</div>
    </div>
  );
}
