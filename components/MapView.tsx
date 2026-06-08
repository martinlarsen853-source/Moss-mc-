"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Pub, PUBS, getNearestPubs } from "@/lib/pubs";
import BottomSheet from "./BottomSheet";
import PubDetailCard from "./PubDetailCard";

const OSLO_CENTER = { lat: 59.9139, lng: 10.7522 };

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [nearestPubs, setNearestPubs] = useState<Pub[]>([]);
  const [selectedPub, setSelectedPub] = useState<Pub | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    const loader = new Loader({ apiKey, version: "weekly" });

    loader.load().then(async () => {
      const { Map } = (await google.maps.importLibrary(
        "maps"
      )) as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = (await google.maps.importLibrary(
        "marker"
      )) as google.maps.MarkerLibrary;

      if (!mapRef.current) return;

      const map = new Map(mapRef.current, {
        center: OSLO_CENTER,
        zoom: 14,
        mapId: "wc2026",
        disableDefaultUI: true,
        gestureHandling: "greedy",
        styles: [
          { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#2c2c54" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#0f3460" }],
          },
          {
            featureType: "poi",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Add pub markers
      PUBS.forEach((pub) => {
        const el = document.createElement("div");
        el.className = "pub-marker";
        el.innerHTML = pub.showingMatch ? "🍺" : "🍻";
        el.style.cssText =
          "font-size:24px;cursor:pointer;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))";

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: pub.lat, lng: pub.lng },
          content: el,
          title: pub.name,
        });

        marker.addListener("click", () => {
          setSelectedPub({ ...pub });
        });
      });

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;

            // User location marker
            const userEl = document.createElement("div");
            userEl.innerHTML = "📍";
            userEl.style.cssText = "font-size:28px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6))";
            new AdvancedMarkerElement({
              map,
              position: { lat, lng },
              content: userEl,
              title: "Din posisjon",
            });

            map.setCenter({ lat, lng });

            const nearest = getNearestPubs(lat, lng, 3);
            setNearestPubs(nearest);
            setTimeout(() => setSheetVisible(true), 600);
          },
          () => {
            setLocationError(true);
            const nearest = getNearestPubs(OSLO_CENTER.lat, OSLO_CENTER.lng, 3);
            setNearestPubs(nearest);
            setTimeout(() => setSheetVisible(true), 600);
          }
        );
      } else {
        const nearest = getNearestPubs(OSLO_CENTER.lat, OSLO_CENTER.lng, 3);
        setNearestPubs(nearest);
        setTimeout(() => setSheetVisible(true), 600);
      }
    });
  }, []);

  const noApiKey = !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-950">
      {/* Map */}
      <div ref={mapRef} className="h-full w-full" />

      {/* No API key fallback */}
      {noApiKey && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 gap-4 p-6 text-center">
          <div className="text-5xl">🗺️</div>
          <p className="text-white font-semibold">Mangler Google Maps API-nøkkel</p>
          <p className="text-zinc-400 text-sm">
            Legg til{" "}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-green-400">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            </code>{" "}
            i <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-green-400">.env.local</code>
          </p>
        </div>
      )}

      {/* Top banner */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-safe pt-4 px-4 pointer-events-none">
        <div className="rounded-2xl bg-zinc-900/90 backdrop-blur px-5 py-3 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇳🇴</span>
            <div className="text-center">
              <div className="text-xs font-bold text-white tracking-widest uppercase">VM 2026</div>
              <div className="text-[11px] text-zinc-400">26. juni · kl. 21:00</div>
            </div>
            <span className="text-2xl">🇫🇷</span>
          </div>
        </div>
      </div>

      {/* Location error notice */}
      {locationError && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 rounded-xl bg-amber-500/20 border border-amber-500/40 px-4 py-2 text-xs text-amber-300">
          📍 Bruker Oslo sentrum som utgangspunkt
        </div>
      )}

      {/* Bottom sheet */}
      <BottomSheet
        pubs={nearestPubs}
        visible={sheetVisible && !selectedPub}
        onSelectPub={setSelectedPub}
      />

      {/* Pub detail */}
      {selectedPub && (
        <PubDetailCard pub={selectedPub} onClose={() => setSelectedPub(null)} />
      )}
    </div>
  );
}
