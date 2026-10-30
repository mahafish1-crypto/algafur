"use client";

import React, { useEffect, useRef, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { isRouteExcludedFromPixel } from "@/lib/meta-pixel";

interface MetaPixelTrackerProps {
  pixelId?: string;
  enabled?: boolean;
}

function MetaPixelTrackerInner({
  pixelId,
  enabled = false,
}: MetaPixelTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrlRef = useRef<string | null>(null);

  // Validate clean numeric pixel ID (digits only, e.g. 15-16 digits)
  const cleanPixelId = pixelId ? pixelId.replace(/\D/g, "") : "";
  const isTrackingActive = Boolean(
    enabled && cleanPixelId && cleanPixelId.length >= 10
  );
  const isExcluded = isRouteExcludedFromPixel(pathname);

  // Track subsequent PageView on client-side route changes with strict deduplication
  useEffect(() => {
    if (!isTrackingActive || isExcluded) return;
    if (typeof window === "undefined") return;

    const queryStr = searchParams?.toString();
    const currentUrl = `${pathname || "/"}${queryStr ? `?${queryStr}` : ""}`;

    // Deduplication check: prevent duplicate PageView triggers on the same URL
    if (lastTrackedUrlRef.current === currentUrl) {
      return;
    }

    lastTrackedUrlRef.current = currentUrl;

    if (window.fbq && typeof window.fbq === "function") {
      try {
        window.fbq("track", "PageView");
      } catch (err) {
        console.debug("[MetaPixel] PageView failed:", err);
      }
    }
  }, [pathname, searchParams, isTrackingActive, isExcluded]);

  // Do not render anything on excluded routes or when pixel is inactive
  if (!isTrackingActive || isExcluded) {
    return null;
  }

  return (
    <>
      <Script
        id={`meta-pixel-${cleanPixelId}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${cleanPixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${cleanPixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

export default function MetaPixelTracker(props: MetaPixelTrackerProps) {
  return (
    <Suspense fallback={null}>
      <MetaPixelTrackerInner {...props} />
    </Suspense>
  );
}
