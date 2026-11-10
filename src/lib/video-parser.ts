/**
 * Video Parser & Embed Resolver for AL GAFUR Reviews Engine
 * Supports standard YouTube, youtu.be, YouTube Shorts, Instagram Reels, and direct video files.
 */

export interface ParsedVideo {
  type: "youtube" | "instagram" | "direct" | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  originalUrl: string;
  videoId?: string;
  isShort?: boolean;
}

export function parseVideoUrl(rawUrl?: string | null): ParsedVideo {
  if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) {
    return {
      type: null,
      embedUrl: null,
      thumbnailUrl: null,
      originalUrl: "",
    };
  }

  const url = rawUrl.trim();

  // 1. YouTube Shorts: https://www.youtube.com/shorts/{videoId}
  const ytShortsMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,15})/i);
  if (ytShortsMatch && ytShortsMatch[1]) {
    const videoId = ytShortsMatch[1];
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: url,
      videoId,
      isShort: true,
    };
  }

  // 2. YouTube Standard: watch?v={videoId}
  const ytWatchMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{6,15})/i);
  if (ytWatchMatch && ytWatchMatch[1]) {
    const videoId = ytWatchMatch[1];
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: url,
      videoId,
      isShort: false,
    };
  }

  // 3. YouTube Short Link: https://youtu.be/{videoId}
  const ytBeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{6,15})/i);
  if (ytBeMatch && ytBeMatch[1]) {
    const videoId = ytBeMatch[1];
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: url,
      videoId,
      isShort: false,
    };
  }

  // 4. YouTube Embed Link: https://www.youtube.com/embed/{videoId}
  const ytEmbedMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{6,15})/i);
  if (ytEmbedMatch && ytEmbedMatch[1]) {
    const videoId = ytEmbedMatch[1];
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: url,
      videoId,
      isShort: false,
    };
  }

  // 5. Instagram Reels: https://www.instagram.com/reel/{code}/
  const igReelMatch = url.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/reel\/([a-zA-Z0-9_-]+)/i);
  if (igReelMatch && igReelMatch[1]) {
    const code = igReelMatch[1];
    return {
      type: "instagram",
      embedUrl: `https://www.instagram.com/reel/${code}/embed`,
      thumbnailUrl: null,
      originalUrl: url,
      videoId: code,
      isShort: true,
    };
  }

  // 6. Instagram Post / Video: https://www.instagram.com/p/{code}/
  const igPostMatch = url.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)/i);
  if (igPostMatch && igPostMatch[1]) {
    const code = igPostMatch[1];
    return {
      type: "instagram",
      embedUrl: `https://www.instagram.com/p/${code}/embed`,
      thumbnailUrl: null,
      originalUrl: url,
      videoId: code,
      isShort: false,
    };
  }

  // 7. Direct video files: .mp4, .webm, .ogg
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return {
      type: "direct",
      embedUrl: url,
      thumbnailUrl: null,
      originalUrl: url,
    };
  }

  return {
    type: null,
    embedUrl: null,
    thumbnailUrl: null,
    originalUrl: url,
  };
}
