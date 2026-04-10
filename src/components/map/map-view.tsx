"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, MAP_DEFAULTS } from "@/lib/mapbox/config";
import { CATEGORY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { POIWithRelations } from "@/types/database";

interface MapViewProps {
  pois?: POIWithRelations[];
  route?: [number, number][];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  className?: string;
  onMarkerClick?: (poi: POIWithRelations) => void;
}

export function MapView({
  pois = [],
  route,
  center,
  zoom,
  interactive = true,
  className,
  onMarkerClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_DEFAULTS.style,
      center: center || MAP_DEFAULTS.center,
      zoom: zoom ?? MAP_DEFAULTS.zoom,
      maxZoom: MAP_DEFAULTS.maxZoom,
      minZoom: MAP_DEFAULTS.minZoom,
      interactive,
      attributionControl: false,
    });

    if (interactive) {
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    mapRef.current = map;

    return () => {
      clearMarkers();
      map.remove();
    };
  }, [center, zoom, interactive, clearMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    clearMarkers();

    pois.forEach((poi) => {
      const color =
        CATEGORY_COLORS[poi.category?.slug || ""] || "#1a2f23";

      // Mapbox sets `transform: translate(x, y)` on the outer element
      // to position the marker, so we put our visual circle in an
      // inner child and apply the hover scale to the child only —
      // otherwise the scale() overwrites the translate() and the
      // marker jumps to the top-left of the map.
      const el = document.createElement("div");
      el.className = "map-marker";
      el.style.cssText = `width: 28px; height: 28px; cursor: pointer;`;

      const inner = document.createElement("div");
      inner.style.cssText = `
        width: 100%; height: 100%; border-radius: 50%;
        background: ${color}; border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: transform 0.2s;
      `;
      el.appendChild(inner);

      el.addEventListener("mouseenter", () => {
        inner.style.transform = "scale(1.2)";
      });
      el.addEventListener("mouseleave", () => {
        inner.style.transform = "scale(1)";
      });

      const popup = new mapboxgl.Popup({
        offset: 20,
        closeButton: true,
        maxWidth: "240px",
      }).setHTML(`
        <div style="padding: 12px;">
          <p style="font-size: 14px; font-weight: 600; color: #1a2f23; margin: 0 0 4px;">
            ${poi.name}
          </p>
          <p style="font-size: 12px; color: #5c6d62; margin: 0;">
            ${poi.category?.name || ""}
          </p>
          <a href="/pois/${poi.slug}" style="display: inline-block; margin-top: 8px; font-size: 12px; color: #c4956a; text-decoration: none; font-weight: 500;">
            View details &rarr;
          </a>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([poi.lng, poi.lat])
        .setPopup(popup)
        .addTo(map);

      if (onMarkerClick) {
        el.addEventListener("click", () => onMarkerClick(poi));
      }

      markersRef.current.push(marker);
    });

    if (pois.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      pois.forEach((poi) => bounds.extend([poi.lng, poi.lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }
  }, [pois, onMarkerClick, clearMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route || route.length < 2) return;

    const addRoute = () => {
      if (map.getSource("route")) {
        (map.getSource("route") as mapboxgl.GeoJSONSource).setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: route },
        });
      } else {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: route },
          },
        });
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#c4956a",
            "line-width": 3,
            "line-dasharray": [2, 2],
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      addRoute();
    } else {
      map.on("load", addRoute);
    }
  }, [route]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted rounded-xl text-muted-foreground text-sm",
          className
        )}
      >
        Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the map
      </div>
    );
  }

  return <div ref={containerRef} className={cn("w-full h-full", className)} />;
}
