/**
 * Pure date calculation and sorting helpers for packages (Isomorphic: client and server safe)
 */

export function parseDateString(s: string): number | null {
  if (!s || !s.trim()) return null;
  const str = s.trim();
  // Filter out non-dated recurring indicators
  if (/scheduled|monthly|weekly|custom/i.test(str) && !/\d{4}/.test(str)) {
    return null;
  }
  // Extract initial date before range delimiter (e.g., "31 October – 19 November 2026")
  let clean = str.split(/[–—]/)[0].trim();
  if (!/\d{4}/.test(clean)) {
    const yearMatch = str.match(/\d{4}/);
    if (yearMatch) clean += ` ${yearMatch[0]}`;
  }
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d.getTime();
}

export function getPackageDepartureTimestamp(pkg: {
  startDate?: Date | string | null;
  departureDate?: string | null;
  departureGroups?: Array<{ departureDate?: string | null; startDate?: Date | string | null }> | null;
}): number | null {
  if (pkg.startDate) {
    const d = new Date(pkg.startDate);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  if (pkg.departureGroups && Array.isArray(pkg.departureGroups) && pkg.departureGroups.length > 0) {
    for (const dg of pkg.departureGroups) {
      if (dg.startDate) {
        const d = new Date(dg.startDate);
        if (!isNaN(d.getTime())) return d.getTime();
      }
      if (dg.departureDate) {
        const parsed = parseDateString(dg.departureDate);
        if (parsed !== null) return parsed;
      }
    }
  }

  if (pkg.departureDate && typeof pkg.departureDate === "string") {
    return parseDateString(pkg.departureDate);
  }
  return null;
}

