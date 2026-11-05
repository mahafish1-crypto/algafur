/**
 * Shared, client-safe helper for parsing Holy Ziyarat landmarks
 * from either JSON string or legacy newline-separated text.
 */
export function parseZiyaratLandmarks(highlights: string | null | undefined): {
  makkah: string[];
  madinah: string[];
} {
  if (!highlights || typeof highlights !== "string" || !highlights.trim()) {
    return { makkah: [], madinah: [] };
  }

  const trimmed = highlights.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        makkah: Array.isArray(parsed.makkah) ? parsed.makkah.filter(Boolean) : [],
        madinah: Array.isArray(parsed.madinah) ? parsed.madinah.filter(Boolean) : [],
      };
    } catch {}
  }

  const makkah: string[] = [];
  const madinah: string[] = [];
  const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.toLowerCase().startsWith("makkah ziyarat:")) {
      const name = line.replace(/^makkah ziyarat:\s*/i, "").trim();
      if (name && !makkah.includes(name)) makkah.push(name);
    } else if (line.toLowerCase().startsWith("madinah ziyarat:")) {
      const name = line.replace(/^madinah ziyarat:\s*/i, "").trim();
      if (name && !madinah.includes(name)) madinah.push(name);
    } else {
      if (line && !makkah.includes(line)) makkah.push(line);
    }
  }

  return { makkah, madinah };
}

