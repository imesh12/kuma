import { Marker } from 'react-map-gl/mapbox';

export function ReportMarker({
  longitude,
  latitude,
  color,
  label,
  selected,
  onClick,
}: {
  longitude: number;
  latitude: number;
  color: 'red' | 'blue';
  label?: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Marker longitude={longitude} latitude={latitude} onClick={onClick}>
      <button
        type="button"
        aria-label={label}
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-lg ${
          color === 'red' ? 'bg-red-500' : 'bg-blue-500'
        } ${selected ? 'scale-125' : ''}`}
      >
        <span className="sr-only">{label}</span>
      </button>
    </Marker>
  );
}
