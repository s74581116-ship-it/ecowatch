import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { EnvironmentalReport } from '../types';

interface LeafletMapProps {
  reports?: EnvironmentalReport[];
  singleLocation?: {
    latitude: number;
    longitude: number;
    title?: string;
  };
  onSelectReport?: (report: EnvironmentalReport) => void;
  height?: string;
  className?: string;
}

export default function LeafletMap({
  reports = [],
  singleLocation,
  onSelectReport,
  height = '500px',
  className = '',
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let defaultLat = 22.9734;
    let defaultLng = 78.6569;
    let defaultZoom = 5;

    if (singleLocation) {
      defaultLat = singleLocation.latitude;
      defaultLng = singleLocation.longitude;
      defaultZoom = 14;
    } else if (reports.length > 0) {
      const valid = reports.find((r) => r.latitude !== null && r.longitude !== null);
      if (valid && valid.latitude && valid.longitude) {
        defaultLat = valid.latitude;
        defaultLng = valid.longitude;
        defaultZoom = 6;
      }
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: defaultZoom,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Pin color based on severity:
    // Low: green / neutral (#2F7D4A)
    // Medium: yellow / amber (#C58A28)
    // High: orange (#D97706)
    // Critical: red (#B64242)
    const getPinColor = (severity?: string, isEmergency = false) => {
      if (isEmergency || severity === 'CRITICAL') return '#B64242';
      if (severity === 'HIGH') return '#D97706';
      if (severity === 'MEDIUM') return '#C58A28';
      return '#2F7D4A';
    };

    const createCustomIcon = (severity?: string, isEmergency = false) => {
      const pinColor = getPinColor(severity, isEmergency);
      const svgIcon = `
        <div style="
          width: 32px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
        ">
          <svg width="32" height="38" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 12 30 12 30C12 30 24 19.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="${pinColor}" stroke="#ffffff" stroke-width="2"/>
            <circle cx="12" cy="11" r="4.5" fill="#ffffff"/>
            <circle cx="12" cy="11" r="2.2" fill="${pinColor}"/>
          </svg>
        </div>
      `;
      return L.divIcon({
        html: svgIcon,
        className: 'custom-leaflet-marker',
        iconSize: [32, 38],
        iconAnchor: [16, 38],
        popupAnchor: [0, -34],
      });
    };

    if (singleLocation) {
      const marker = L.marker([singleLocation.latitude, singleLocation.longitude], {
        icon: createCustomIcon('LOW', false),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; max-width: 220px;">
          <strong style="font-size: 13px; color: #17201B;">${singleLocation.title || 'Report Incident Location'}</strong>
          <div style="font-size: 11px; color: #65736A; margin-top: 4px;">
            Lat: ${singleLocation.latitude.toFixed(5)}<br/>
            Lng: ${singleLocation.longitude.toFixed(5)}
          </div>
        </div>
      `).openPopup();

      map.setView([singleLocation.latitude, singleLocation.longitude], 14);
    } else {
      const bounds = L.latLngBounds([]);
      let markersAdded = 0;

      reports.forEach((report) => {
        if (
          report.latitude !== null &&
          report.longitude !== null &&
          !isNaN(report.latitude) &&
          !isNaN(report.longitude)
        ) {
          const latLng = L.latLng(report.latitude, report.longitude);
          bounds.extend(latLng);

          const marker = L.marker(latLng, {
            icon: createCustomIcon(report.severity, report.isEmergency),
          }).addTo(map);

          const popupContent = document.createElement('div');
          popupContent.className = 'ecowatch-map-popup';

          const imageHtml = report.imageUrl
            ? `<div style="margin-bottom: 8px; border-radius: 8px; overflow: hidden; height: 85px; background: #f0f0f0;">
                 <img src="${report.imageUrl}" alt="${report.category}" style="width: 100%; height: 100%; object-fit: cover;" />
               </div>`
            : '';

          popupContent.innerHTML = `
            <div style="font-family: inherit; font-size: 12px; color: #17201B; line-height: 1.4; padding: 4px; min-width: 200px; max-width: 240px;">
              ${imageHtml}
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
                <span style="font-weight: 800; font-size: 12px; color: #174A35; font-family: monospace;">${report.issueId}</span>
                <span style="background: #EAF4EC; color: #174A35; border: 1px solid #C8E2CE; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; text-transform: uppercase;">
                  ${report.status}
                </span>
              </div>
              <div style="font-weight: 700; color: #17201B; font-size: 13px; margin-bottom: 3px;">${report.category}</div>
              <div style="font-size: 11px; color: #65736A; margin-bottom: 6px;">
                Severity: <strong style="color: ${getPinColor(report.severity, report.isEmergency)};">${report.severity}</strong>
                ${report.isEmergency ? ' • <span style="color: #B64242; font-weight: 800;">EMERGENCY</span>' : ''}
              </div>
              <div style="font-size: 11px; color: #65736A; margin-bottom: 10px; max-height: 36px; overflow: hidden; text-overflow: ellipsis;">
                ${report.locationText || 'No address specified'}
              </div>
              <button
                id="btn-view-map-report-${report.issueId}"
                style="width: 100%; background: #174A35; color: #ffffff; border: none; padding: 7px 12px; font-size: 11px; font-weight: 700; border-radius: 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: background 0.2s;"
              >
                View Full Report
              </button>
            </div>
          `;

          const viewBtn = popupContent.querySelector(`#btn-view-map-report-${report.issueId}`);
          if (viewBtn && onSelectReport) {
            viewBtn.addEventListener('click', () => {
              onSelectReport(report);
            });
          }

          marker.bindPopup(popupContent);
          markersAdded++;
        }
      });

      if (markersAdded > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [reports, singleLocation, onSelectReport]);

  return (
    <div
      id="leaflet-map-wrapper"
      className={`relative w-full rounded-2xl overflow-hidden border border-[#DCE5DE] shadow-xs bg-[#F7F9F5] ${className}`}
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] text-[#65736A] font-medium border border-[#DCE5DE] pointer-events-none">
        OpenStreetMap • Leaflet
      </div>
    </div>
  );
}
