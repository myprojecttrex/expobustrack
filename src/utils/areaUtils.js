import { DISTRICT_COORDS } from "../config/districtCoords";

// distance between 2 GPS points
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// 🔥 CREATE AREA (FIXED 80 KM)
export function generateArea(from, to) {
  const A = DISTRICT_COORDS[from];
  const B = DISTRICT_COORDS[to];

  if (!A || !B) return null;

  return {
    center: {
      lat: (A.lat + B.lat) / 2,
      lng: (A.lng + B.lng) / 2,
    },
    radiusKm: 80, // ✅ FINAL VALUE
  };
}

// check bus inside area
export function isInsideArea(bus, area) {
  if (!area) return false;

  const d = distanceKm(
    bus.latitude,
    bus.longitude,
    area.center.lat,
    area.center.lng
  );

  return d <= area.radiusKm;
}
