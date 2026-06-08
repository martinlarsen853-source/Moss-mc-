"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { Pub, PUBS, getNearestPubs } from "@/lib/pubs";
import BottomSheet from "./BottomSheet";
import MiniPubCard from "./MiniPubCard";
import PubDetailCard from "./PubDetailCard";

const OSLO_CENTER = { lat: 59.9139, lng: 10.7522 };

type CardState = "none" | "mini" | "full";

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [nearestPubs, setNearestPubs] = useState<Pub[]>([]);
  const [selectedPub, setSelectedPub] = useState<Pub | null>(null);
  const [cardState, setCardState] = useState<CardState>("none");
  const [sheetVisible, setSheetVisible] = useState(false);
  const [locationError, setLocationError] = useState(false);

  function selectPub(pub: Pub) {
    setSelectedPub(pub);
    setCardState("mini");
    setSheetVisible(false);
  }

  function expandCard() {
    setCardState("full");
  }

  function closeCard() {
    setCardState("none");
    setSelectedPub(null);
  }

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    setOptions({ key: apiKey, v: "weekly" });

    Promise.all([importLibrary("maps"), importLibrary("marker")]).then(
      ([mapsLib, markerLib]) => {
        const { Map } = mapsLib;
        const { AdvancedMarkerElement } = markerLib;

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
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c54" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f3460" }] },
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        });

        // Close card when map is tapped
        map.addListener("click", () => {
          setCardState((s) => (s === "full" ? "mini" : "none"));
          setSelectedPub((p) => (p ? p : null));
        });

        PUBS.forEach((pub) => {
          const el = document.createElement("div");
          el.innerHTML = pub.showingMatch ? "🍺" : "🍻";
          el.style.cssText =
            "font-size:26px;cursor:pointer;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6));transition:transform 0.15s";
          el.onmouseenter = () => (el.style.transform = "scale(1.2)");
          el.onmouseleave = () => (el.style.transform = "scale(1)");

          const marker = new AdvancedMarkerElement({
            map,
            position: { lat: pub.lat, lng: pub.lng },
            content: el,
            title: pub.name,
          });

          marker.addListener("click", () => selectPub(pub));
        });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude: lat, longitude: lng } = pos.coords;

              const userEl = document.createElement("div");
              userEl.innerHTML = "📍";
              userEl.style.cssText =
                "font-size:28px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6))";
              new AdvancedMarkerElement({
                map,
                position: { lat, lng },
                content: userEl,
                title: "Din posisjon",
              });

              map.setCenter({ lat, lng });
              setNearestPubs(getNearestPubs(lat, lng, 3));
              setTimeout(() => setSheetVisible(true), 600);
            },
            () => {
              setLocationError(true);
              setNearestPubs(getNearestPubs(OSLO_CENTER.lat, OSLO_CENTER.lng, 3));
              setTimeout(() => setSheetVisible(true), 600);
            }
          );
        } else {
          setNearestPubs(getNearestPubs(OSLO_CENTER.lat, OSLO_CENTER.lng, 3));
          setTimeout(() => setSheetVisible(true), 600);
        }
      }
    );
  }, []);

  const noApiKey = !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-950">
      <div ref={mapRef} className="h-full w-full" />

      {noApiKey && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 gap-4 p-6 text-center">
          <div className="text-5xl">🗺️</div>
          <p className="text-white font-semibold">Mangler Google Maps API-nøkkel</p>
          <p className="text-zinc-400 text-sm">
            Legg til{" "}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-green-400">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            </code>{" "}
            i Vercel Environment Variables
          </p>
        </div>
      )}

      {/* Top banner */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-4 px-4 pointer-events-none">
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

      {locationError && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 rounded-xl bg-amber-500/20 border border-amber-500/40 px-4 py-2 text-xs text-amber-300 whitespace-nowrap">
          📍 Bruker Oslo sentrum som utgangspunkt
        </div>
      )}

      {/* Nearest pubs list */}
      <BottomSheet
        pubs={nearestPubs}
        visible={sheetVisible && cardState === "none"}
        onSelectPub={selectPub}
      />

      {/* Mini card (marker tap) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${
          cardState === "mini"
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {selectedPub && (
          <MiniPubCard
            pub={selectedPub}
            onExpand={expandCard}
            onClose={closeCard}
          />
        )}
      </div>

      {/* Full detail card */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
          cardState === "full"
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {selectedPub && (
          <PubDetailCard pub={selectedPub} onClose={closeCard} />
        )}
      </div>
    </div>
  );
}
