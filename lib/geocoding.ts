/**
 * Geocoding via Nominatim (OpenStreetMap) — gratuit, pas de clé API requise
 * Usage policy: max 1 req/s, User-Agent obligatoire
 */

interface GeoResult {
  lat: number;
  lng: number;
}

/**
 * Géocode une ville suisse en coordonnées GPS.
 * Retourne null si la ville n'est pas trouvée ou en cas d'erreur.
 */
export async function geocodeCity(city: string): Promise<GeoResult | null> {
  try {
    const query = `${city}, Switzerland`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=ch`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "ServiGo/1.0 (contact@servigo.ch)",
        "Accept-Language": "fr",
      },
      next: { revalidate: 86400 }, // cache 24h
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}

/**
 * Calcule la distance en km entre deux points GPS (formule de Haversine)
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
