'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Icons ───────────────────────────────────────────────────────────────────
const makeIcon = (color: string) =>
    L.divIcon({
        className: '',
        html: `<div style="
            width:14px;height:14px;border-radius:50%;
            background:${color};border:2.5px solid white;
            box-shadow:0 1px 6px rgba(0,0,0,.4);">
        </div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });

const vehicleIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [22, 36],
    iconAnchor: [11, 36],
});

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TripMarker {
    id: string;
    label: string;
    status: string;
    startPoint: string;
    endPoint: string;
}

interface ResolvedRoute {
    id: string;
    label: string;
    status: string;
    startCoord: [number, number];
    endCoord: [number, number];
    routeCoords: [number, number][];
}

// ─── Geocoding (Nominatim, free, no key) ─────────────────────────────────────
const geocodeCache: Record<string, [number, number] | null> = {};

// Words to strip when falling back to a simpler query
const STRIP_WORDS = ['port', 'hub', 'warehouse', 'depot', 'factory', 'yard', 'center', 'centre', 'area', 'zone', 'distribution', 'industrial', 'textile', 'station'];

function simplifyPlace(place: string): string {
    const words = place.toLowerCase().split(/\s+/);
    const cleaned = words.filter(w => !STRIP_WORDS.includes(w));
    return cleaned.join(' ') || words[0];
}

async function nominatimFetch(query: string): Promise<[number, number] | null> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
}

async function geocode(place: string): Promise<[number, number] | null> {
    if (geocodeCache[place] !== undefined) return geocodeCache[place];
    try {
        // Attempt 1: exact name
        let coord = await nominatimFetch(`${place}, India`);
        // Attempt 2: strip hub/warehouse/depot keywords
        if (!coord) {
            const simplified = simplifyPlace(place);
            if (simplified !== place.toLowerCase()) {
                coord = await nominatimFetch(`${simplified}, India`);
            }
        }
        // Attempt 3: just the first word (most likely a city name)
        if (!coord) {
            const firstWord = place.split(/[\s,]+/)[0];
            coord = await nominatimFetch(`${firstWord}, India`);
        }
        geocodeCache[place] = coord;
        return coord;
    } catch { /* ignore */ }
    geocodeCache[place] = null;
    return null;
}

// ─── OSRM road routing (free, no key) ────────────────────────────────────────
async function fetchRoute(from: [number, number], to: [number, number]): Promise<[number, number][]> {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]) {
            return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
        }
    } catch { /* ignore */ }
    return [from, to]; // fallback: straight line
}

// ─── Auto-fit bounds ──────────────────────────────────────────────────────────
const AutoFitBounds: React.FC<{ routes: ResolvedRoute[] }> = ({ routes }) => {
    const map = useMap();
    React.useEffect(() => {
        if (!routes.length) return;
        const allCoords = routes.flatMap(r => [r.startCoord, r.endCoord]);
        if (allCoords.length > 0) {
            map.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40] });
        }
    }, [routes, map]);
    return null;
};

// ─── Status color ─────────────────────────────────────────────────────────────
const statusColor = (s: string) => {
    if (s === 'Completed') return '#10b981';
    if (s === 'Dispatched') return '#3b82f6';
    return '#94a3b8';
};

// ─── Component ────────────────────────────────────────────────────────────────
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

const TripMap: React.FC<{ markers: TripMarker[] }> = ({ markers }) => {
    const [isMounted, setIsMounted] = React.useState(false);
    const [routes, setRoutes] = React.useState<ResolvedRoute[]>([]);
    const [resolving, setResolving] = React.useState(false);
    const resolvedKeyRef = React.useRef<string>('');

    React.useEffect(() => { setIsMounted(true); }, []);

    // Geocode + fetch routes whenever the markers set changes
    React.useEffect(() => {
        if (!isMounted || !markers.length || resolving) return;
        const key = markers.map(m => m.id).join(',');
        if (resolvedKeyRef.current === key) return;  // same set, skip
        resolvedKeyRef.current = key;
        setResolving(true);

        const resolve = async () => {
            const results: ResolvedRoute[] = [];
            for (const m of markers) {
                const [startCoord, endCoord] = await Promise.all([
                    geocode(m.startPoint),
                    geocode(m.endPoint),
                ]);
                if (!startCoord || !endCoord) continue;
                // Nominatim asks for max 1 req/s — 300ms between iterations is safe
                await new Promise(r => setTimeout(r, 300));
                const routeCoords = await fetchRoute(startCoord, endCoord);
                results.push({ id: m.id, label: m.label, status: m.status, startCoord, endCoord, routeCoords });
                // Update map progressively as each route resolves
                setRoutes(prev => {
                    const without = prev.filter(r => r.id !== m.id);
                    return [...without, { id: m.id, label: m.label, status: m.status, startCoord: startCoord!, endCoord: endCoord!, routeCoords }];
                });
            }
            setResolving(false);
        };

        resolve();
    }, [isMounted, markers, resolving]);

    if (!isMounted) {
        return <div className="h-[440px] w-full rounded-2xl bg-slate-50 animate-pulse border border-slate-100 shadow-sm" />;
    }

    return (
        <div className="relative">
            <div className="h-[440px] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative z-0">
                <MapContainer center={DEFAULT_CENTER} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {routes.length > 0 && <AutoFitBounds routes={routes} />}

                    {routes.map(route => (
                        <React.Fragment key={route.id}>
                            {/* Route polyline */}
                            <Polyline
                                positions={route.routeCoords}
                                pathOptions={{
                                    color: statusColor(route.status),
                                    weight: 3,
                                    opacity: 0.75,
                                    dashArray: route.status === 'Dispatched' ? '8 6' : undefined,
                                }}
                            />
                            {/* Start marker (green dot) */}
                            <Marker position={route.startCoord} icon={makeIcon('#10b981')}>
                                <Popup>
                                    <div className="text-xs font-bold text-emerald-600">🟢 Start</div>
                                    <div className="text-sm font-bold">{markers.find(m => m.id === route.id)?.startPoint}</div>
                                </Popup>
                            </Marker>
                            {/* End marker (red dot) */}
                            <Marker position={route.endCoord} icon={makeIcon('#ef4444')}>
                                <Popup>
                                    <div className="text-xs font-bold text-red-500">🔴 End</div>
                                    <div className="text-sm font-bold">{markers.find(m => m.id === route.id)?.endPoint}</div>
                                </Popup>
                            </Marker>
                            {/* Vehicle pin at midpoint */}
                            <Marker
                                position={route.routeCoords[Math.floor(route.routeCoords.length / 2)] || route.startCoord}
                                icon={vehicleIcon}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <div className="font-bold text-slate-900">{route.label}</div>
                                        <div className="text-xs font-bold mt-1 uppercase" style={{ color: statusColor(route.status) }}>
                                            {route.status}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {markers.find(m => m.id === route.id)?.startPoint} → {markers.find(m => m.id === route.id)?.endPoint}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        </React.Fragment>
                    ))}
                </MapContainer>

                {/* Loading overlay */}
                {resolving && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-100 text-xs font-bold text-slate-600 flex items-center gap-2 z-[999]">
                        <svg className="animate-spin h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Plotting routes...
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-3 px-1 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Start
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> End
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-7 h-0.5 bg-blue-500 inline-block border-dashed border-t-2 border-blue-500" /> Dispatched
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-7 h-0.5 bg-emerald-500 inline-block" /> Completed
                </span>
            </div>
        </div>
    );
};

export default TripMap;
