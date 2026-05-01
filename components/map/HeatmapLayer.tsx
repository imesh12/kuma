import { Layer, Source } from 'react-map-gl/mapbox';
import type { HeatmapPaint } from 'mapbox-gl';
import { heatmapPaint } from '@/lib/map/map-style';
import type { ReportsGeoJson } from '@/lib/map/reports-to-geojson';

export function HeatmapLayer({ data }: { data: ReportsGeoJson }) {
  return (
    <Source id="reports-heatmap" type="geojson" data={data}>
      <Layer id="reports-heatmap-layer" type="heatmap" paint={heatmapPaint as HeatmapPaint} />
    </Source>
  );
}
