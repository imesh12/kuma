export type ReportPoint = {
  id: string;
  title: string;
  publicLat: number;
  publicLng: number;
  severityLabel: string;
  statusLabel: string;
  sourceTypeLabel: string;
};

export type ReportsGeoJson = ReturnType<typeof reportsToGeoJson>;

export function reportsToGeoJson(reports: ReportPoint[]) {
  return {
    type: 'FeatureCollection' as const,
    features: reports.map((report) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [report.publicLng, report.publicLat] as [number, number],
      },
      properties: {
        id: report.id,
        title: report.title,
        severityLabel: report.severityLabel,
        statusLabel: report.statusLabel,
        sourceTypeLabel: report.sourceTypeLabel,
      },
    })),
  };
}
