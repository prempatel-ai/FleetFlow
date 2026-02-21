'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface TripMapProps {
    markers: {
        id: string;
        position: [number, number];
        label: string;
        status: string;
    }[];
}

const TripMap: React.FC<TripMapProps> = ({ markers }) => {
    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative z-0">
            <MapContainer
                center={[20.5937, 78.9629]} // Center of India or default
                zoom={5}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {markers.map((marker) => (
                    <Marker key={marker.id} position={marker.position} icon={defaultIcon}>
                        <Popup>
                            <div className="p-1">
                                <div className="font-bold text-slate-900">{marker.label}</div>
                                <div className="text-xs text-slate-500 uppercase font-bold mt-1">{marker.status}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default TripMap;
