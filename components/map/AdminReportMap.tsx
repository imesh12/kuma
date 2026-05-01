'use client';

import Map, { NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RadiusCircleLayer } from '@/components/map/RadiusCircleLayer';
import { ReportMarker } from '@/components/map/ReportMarker';
import { defaultMapStyle } from '@/lib/map/map-style';

type AdminMapReport = {
  realLat: number;
  realLng: number;
  publicLat: number;
  publicLng: number;
};

export function AdminReportMap({
  report,
  radiusMeters,
}: {
  report: AdminMapReport;
  radiusMeters: number;
}) {
  return (
    <div className="h-[420px] overflow-hidden rounded-2xl ring-1 ring-slate-200">
      <Map
        initialViewState={{
          longitude: report.realLng,
          latitude: report.realLat,
          zoom: 13.5,
        }}
        mapStyle={defaultMapStyle}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <RadiusCircleLayer centerLat={report.realLat} centerLng={report.realLng} radiusMeters={radiusMeters} />
        <ReportMarker longitude={report.realLng} latitude={report.realLat} color="red" label="正確な位置" />
        <ReportMarker longitude={report.publicLng} latitude={report.publicLat} color="blue" label="公開位置" />
      </Map>
    </div>
  );
}
