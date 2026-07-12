export interface LatLngPoint {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two points, in kilometers (haversine formula). */
export function distanceKm(a: LatLngPoint, b: LatLngPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function isPointInRadius(
  point: LatLngPoint,
  center: LatLngPoint,
  radiusKm: number,
): boolean {
  return distanceKm(point, center) <= radiusKm;
}

/**
 * Ray-casting point-in-polygon test. `polygon` is a list of vertices; the
 * closing edge from the last vertex back to the first is implied (callers
 * don't need to repeat the first point at the end).
 */
export function isPointInPolygon(
  point: LatLngPoint,
  polygon: LatLngPoint[],
): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const vertexI = polygon[i];
    const vertexJ = polygon[j];
    if (!vertexI || !vertexJ) continue;

    const crossesRay = vertexI.lat > point.lat !== vertexJ.lat > point.lat;
    if (!crossesRay) continue;

    const intersectionLng =
      ((vertexJ.lng - vertexI.lng) * (point.lat - vertexI.lat)) /
        (vertexJ.lat - vertexI.lat) +
      vertexI.lng;

    if (point.lng < intersectionLng) inside = !inside;
  }

  return inside;
}
