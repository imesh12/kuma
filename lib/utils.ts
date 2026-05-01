export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371e3;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function generateRandomOffset(lat: number, lng: number) {
  const offsetMeters = 100 + Math.random() * 200;
  const angle = Math.random() * Math.PI * 2;

  const latOffset = (offsetMeters * Math.cos(angle)) / 111000;
  const lngOffset = (offsetMeters * Math.sin(angle)) / (111000 * Math.cos((lat * Math.PI) / 180));

  return {
    publicLat: lat + latOffset,
    publicLng: lng + lngOffset,
  };
}

export function getDirectionJapanese(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  const directions = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
  const index = Math.round((bearing % 360) / 45) % 8;
  return directions[index];
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
