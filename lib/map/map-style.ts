export const defaultMapStyle = 'mapbox://styles/mapbox/streets-v12';

export const heatmapPaint = {
  'heatmap-intensity': 0.7,
  'heatmap-radius': 24,
  'heatmap-opacity': 0.5,
  'heatmap-color': [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    'rgba(191, 219, 254, 0)',
    0.2,
    'rgba(59, 130, 246, 0.35)',
    0.5,
    'rgba(245, 158, 11, 0.45)',
    1,
    'rgba(220, 38, 38, 0.75)',
  ],
};
