import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface MapProps {
  className?: string;
}

export function Map({ className }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
          version: "weekly",
          libraries: ["places"]
        });

        await loader.load();

        const restaurantLocation = {
          lat: 11.356991, // Boracay Station 2 coordinates
          lng: 121.959667
        };

        const map = new google.maps.Map(mapRef.current, {
          center: restaurantLocation,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Add marker for the restaurant
        new google.maps.Marker({
          position: restaurantLocation,
          map,
          title: "Kestía Boracay",
          animation: google.maps.Animation.DROP,
        });

      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();
  }, []);

  return (
    <div 
      ref={mapRef} 
      className={className} 
      style={{ 
        width: "100%", 
        height: "100%", 
        minHeight: "400px" 
      }} 
    />
  );
}