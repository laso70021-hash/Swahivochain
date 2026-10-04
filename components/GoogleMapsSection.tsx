'use client';

import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

export interface OfficeLocation {
  id: string;
  city: string;
  country: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  lat: number;
  lng: number;
}

interface GoogleMapsSectionProps {
  offices: OfficeLocation[];
  selectedOffice: OfficeLocation;
  onSelectOffice: (office: OfficeLocation) => void;
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#081426' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#040a16' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#748aa6' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#061320' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#13233a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0b1728' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1e3a5f' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0e2038' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00e5c9' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#112239' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00e5c9' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#020712' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#020712' }],
  },
];

export default function GoogleMapsSection({
  offices,
  selectedOffice,
  onSelectOffice,
}: GoogleMapsSectionProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    'AIzaSyCS8UiQb4hdx1Zm6XDGuRsCovqRr4PrEvI';

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      try {
        setOptions({
          key: apiKey,
          v: 'weekly',
        });

        const { Map, InfoWindow } = (await importLibrary('maps')) as google.maps.MapsLibrary;
        const { Marker } = (await importLibrary('marker')) as google.maps.MarkerLibrary;

        if (!isMounted || !mapContainerRef.current) return;

        const map = new Map(mapContainerRef.current, {
          center: { lat: selectedOffice.lat, lng: selectedOffice.lng },
          zoom: 13,
          styles: darkMapStyle,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;
        const infoWindow = new InfoWindow();
        infoWindowRef.current = infoWindow;

        // Clear existing markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        // Create markers for all offices
        offices.forEach((office) => {
          const marker = new Marker({
            position: { lat: office.lat, lng: office.lng },
            map,
            title: office.city,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: office.id === selectedOffice.id ? 10 : 7,
              fillColor: office.id === selectedOffice.id ? '#00e5c9' : '#38bdf8',
              fillOpacity: 1,
              strokeColor: '#030914',
              strokeWeight: 2,
            },
          });

          marker.addListener('click', () => {
            onSelectOffice(office);
            const content = `
              <div style="padding: 10px 14px; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; max-width: 250px;">
                <h4 style="font-weight: 700; margin: 0 0 3px 0; font-size: 14px; color: #020617;">${office.city}</h4>
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #0d9488;">${office.type}</p>
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #334155; line-height: 1.35;">${office.address}</p>
                <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                  <a href="https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     style="color: #0f766e; font-weight: 700; font-size: 11px; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;">
                     Directions in Google Maps &rarr;
                  </a>
                </div>
              </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
        });

        if (isMounted) {
          setMapLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load Google Maps:', err);
        if (isMounted) {
          setMapError('Unable to load interactive map view.');
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center when selectedOffice changes
  useEffect(() => {
    if (mapInstanceRef.current && window.google) {
      mapInstanceRef.current.panTo({
        lat: selectedOffice.lat,
        lng: selectedOffice.lng,
      });
      mapInstanceRef.current.setZoom(14);

      // Highlight active marker
      markersRef.current.forEach((marker, index) => {
        const office = offices[index];
        const isActive = office.id === selectedOffice.id;
        marker.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isActive ? 10 : 7,
          fillColor: isActive ? '#00e5c9' : '#38bdf8',
          fillOpacity: 1,
          strokeColor: '#030914',
          strokeWeight: 2,
        });
      });
    }
  }, [selectedOffice, offices]);

  return (
    <div className="rounded-3xl bg-[#051020]/90 border border-slate-800/90 overflow-hidden shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left: Office Selection & Details Panel */}
        <div className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#071324]/80">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#00e5c9]">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Interactive Global Map
              </span>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">
              Locate Our Command Hubs
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Select a regional operations center to view on Google Maps, obtain direct contact
              details, or plot turn-by-turn directions.
            </p>

            {/* Office Selector Pills */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {offices.map((office) => {
                const isSelected = office.id === selectedOffice.id;
                return (
                  <button
                    key={office.id}
                    onClick={() => onSelectOffice(office)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#00e5c9] text-[#070d18] font-bold shadow-md shadow-teal-500/20'
                        : 'bg-[#0a182b] text-slate-300 hover:text-white hover:bg-[#0f243f] border border-slate-800'
                    }`}
                  >
                    {office.city.split(',')[0]}
                  </button>
                );
              })}
            </div>

            {/* Selected Office Details Card */}
            <div className="mt-4 p-4 rounded-xl bg-[#050f1d] border border-slate-800/80 space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#00e5c9] uppercase tracking-wider block">
                  {selectedOffice.type}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{selectedOffice.city}</h4>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{selectedOffice.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#00e5c9] shrink-0" />
                  <a
                    href={`tel:${selectedOffice.phone}`}
                    className="hover:text-[#00e5c9] font-mono text-[11.5px]"
                  >
                    {selectedOffice.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#00e5c9] shrink-0" />
                  <a
                    href={`mailto:${selectedOffice.email}`}
                    className="hover:text-[#00e5c9] text-[11.5px] truncate"
                  >
                    {selectedOffice.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-[#00e5c9] shrink-0" />
                  <span className="text-[11px]">{selectedOffice.hours}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOffice.lat},${selectedOffice.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-[#0a182b] hover:bg-[#0f243f] text-[#00e5c9] font-semibold text-xs rounded-xl border border-slate-700/80 transition-colors flex items-center justify-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions in Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right: Map Container */}
        <div className="lg:col-span-8 relative w-full h-[380px] sm:h-[460px] lg:h-auto min-h-[380px] bg-[#081426]">
          <div ref={mapContainerRef} className="w-full h-full" />

          {!mapLoaded && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#081426]/90 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-4 h-4 border-2 border-[#00e5c9] border-t-transparent rounded-full animate-spin" />
                <span>Loading Google Maps Platform...</span>
              </div>
            </div>
          )}

          {mapError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#081426]">
              <MapPin className="w-8 h-8 text-[#00e5c9] mb-2" />
              <p className="text-sm font-bold text-white">{selectedOffice.city} Hub</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">{selectedOffice.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  selectedOffice.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#00e5c9] text-[#070d18] font-bold text-xs rounded-lg flex items-center gap-1.5"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
