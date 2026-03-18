/**
 * Normalizes a city name for consistent storage and comparison.
 * Strips accents, trims whitespace, and applies title case.
 * "Genève " → "Geneve"  |  "geneve" → "Geneve"  |  "LAUSANNE" → "Lausanne"
 */
export function normalizeCity(city: string): string {
  return city
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
