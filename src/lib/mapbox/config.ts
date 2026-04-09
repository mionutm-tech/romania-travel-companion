export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export const MAP_DEFAULTS = {
  center: [24.9668, 45.9432] as [number, number],
  zoom: 6.5,
  style: "mapbox://styles/mapbox/light-v11",
  maxZoom: 18,
  minZoom: 4,
};
