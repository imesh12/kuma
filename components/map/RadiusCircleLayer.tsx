import { Layer, Source } from 'react-map-gl/mapbox';
import { createCircle } from '@/lib/map/create-radius-circle';

export function RadiusCircleLayer({
  centerLat,
  centerLng,
  radiusMeters,
}: {
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
}) {
  return (
    <Source id="alert-radius" type="geojson" data={createCircle(centerLng, centerLat, radiusMeters)}>
      <Layer
        id="alert-radius-fill"
        type="fill"
        paint={{
          'fill-color': '#ef4444',
          'fill-opacity': 0.12,
        }}
      />
      <Layer
        id="alert-radius-line"
        type="line"
        paint={{
          'line-color': '#dc2626',
          'line-width': 2,
        }}
      />
    </Source>
  );
}
