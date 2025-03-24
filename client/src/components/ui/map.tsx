import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface MapProps {
  className?: string;
}

export function Map({ className }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
    });

    const restaurantLocation = {
      lat: 11.356991,  // Boracay Station 2 coordinates
      lng: 121.959667
    };

    loader.load().then(() => {
      const map = new google.maps.Map(mapRef.current!, {
        center: restaurantLocation,
        zoom: 16,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      // Add marker for the restaurant
      new google.maps.Marker({
        position: restaurantLocation,
        map,
        title: "Kestía Boracay",
        animation: google.maps.Animation.DROP,
      });

      setMap(map);
    });
  }, []);

  return (
    <div 
      ref={mapRef} 
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
