'use client';

import { useMemo, useRef, useState } from 'react';
import Map, { MapRef, NavigationControl } from 'react-map-gl/mapbox';
import { HeatmapLayer } from '@/components/map/HeatmapLayer';
import { ReportMarker } from '@/components/map/ReportMarker';
import { ReportPopup } from '@/components/map/ReportPopup';
import { defaultMapStyle } from '@/lib/map/map-style';
import { reportsToGeoJson } from '@/lib/map/reports-to-geojson';

type PublicMapReport = {
  id: string;
  title: string;
  description: string;
  locationLabel: string;
  publicLat: number;
  publicLng: number;
  status: string;
  statusLabel: string;
  sourceTypeLabel: string;
  severity: string;
  severityLabel: string;
  sightedAt: string | Date;
};

export function PublicBearMap({
  reports,
  selectedReportId,
  onSelectReport,
}: {
  reports: PublicMapReport[];
  selectedReportId: string | null;
  onSelectReport: (reportId: string) => void;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const [popupReportId, setPopupReportId] = useState<string | null>(null);

  const data = useMemo(
    () =>
      reportsToGeoJson(
        reports.map((report) => ({
          id: report.id,
          title: report.title,
          publicLat: report.publicLat,
          publicLng: report.publicLng,
          severityLabel: report.severityLabel,
          statusLabel: report.statusLabel,
          sourceTypeLabel: report.sourceTypeLabel,
        }))
      ),
    [reports]
  );

  const selectedReport = reports.find((report) => report.id === (popupReportId ?? selectedReportId)) ?? null;

  return (
    <div className="h-full overflow-hidden rounded-[2rem] ring-1 ring-slate-200">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 139.6917,
          latitude: 36.2048,
          zoom: 5.8,
        }}
        mapStyle={defaultMapStyle}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <HeatmapLayer data={data} />
        {reports.map((report) => (
          <ReportMarker
            key={report.id}
            longitude={report.publicLng}
            latitude={report.publicLat}
            color="blue"
            selected={report.id === selectedReportId}
            label={report.title}
            onClick={() => {
              onSelectReport(report.id);
              setPopupReportId(report.id);
              mapRef.current?.flyTo({ center: [report.publicLng, report.publicLat], zoom: 11, duration: 900 });
            }}
          />
        ))}
        {selectedReport ? <ReportPopup report={selectedReport} onClose={() => setPopupReportId(null)} /> : null}
      </Map>
    </div>
  );
}
