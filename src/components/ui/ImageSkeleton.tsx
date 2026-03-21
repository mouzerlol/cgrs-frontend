'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

interface ImageSkeletonProps extends Omit<ImageProps, 'onLoad'> {
  containerClassName?: string;
}

export function ImageSkeleton({ containerClassName, className, ...props }: ImageSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {!isLoaded && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
      )}
      <Image
        {...props}
        className={cn(
          'transition-opacity duration-500 ease-in-out',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}

export default ImageSkeleton;
