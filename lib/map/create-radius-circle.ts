export function createCircle(centerLng: number, centerLat: number, radiusMeters: number) {
  const points = 64;
  const coords: [number, number][] = [];
  const distanceX = radiusMeters / (111320 * Math.cos((centerLat * Math.PI) / 180));
  const distanceY = radiusMeters / 110540;

  for (let i = 0; i < points; i += 1) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([centerLng + x, centerLat + y]);
  }

  coords.push(coords[0]);

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords],
    },
    properties: {},
  };
}
