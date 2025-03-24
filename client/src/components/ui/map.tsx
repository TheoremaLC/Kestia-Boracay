import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface MapProps {
  className?: string;
}

export function Map({ className }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error("Google Maps API key is not configured");
        }

        const loader = new Loader({
          apiKey,
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

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setError("Failed to load the map. Please try again later.");
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <Skeleton className={className} />;
  }

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