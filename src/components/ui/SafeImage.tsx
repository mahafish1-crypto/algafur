"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

export interface SafeImageProps extends Omit<ImageProps, "src" | "onError"> {
  src?: string | null;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = "/brand/poster.jpg";

export default function SafeImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  alt = "AL GAFUR INTERNATIONAL TOURS AND TRAVELS",
  unoptimized,
  ...rest
}: SafeImageProps) {
  const resolveSrc = (raw?: string | null) => {
    if (typeof raw === "string" && raw.trim().length > 0) {
      return raw.trim();
    }
    return fallbackSrc || DEFAULT_FALLBACK;
  };

  const [imgSrc, setImgSrc] = useState<string>(() => resolveSrc(src));
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(resolveSrc(src));
    setHasFailed(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasFailed) {
      setHasFailed(true);
      const safeFallback = fallbackSrc || DEFAULT_FALLBACK;
      if (imgSrc !== safeFallback) {
        setImgSrc(safeFallback);
      } else if (safeFallback !== DEFAULT_FALLBACK) {
        setImgSrc(DEFAULT_FALLBACK);
      }
    }
  };

  // Internal API media routes must bypass Next.js image proxy on Vercel to avoid serverless recursion
  const isApiRoute = typeof imgSrc === "string" && imgSrc.startsWith("/api/");
  const shouldBeUnoptimized = unoptimized !== undefined ? unoptimized : isApiRoute;

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      unoptimized={shouldBeUnoptimized}
      onError={handleError}
    />
  );
}

