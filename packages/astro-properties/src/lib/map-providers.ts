export type MapProviderKey =
  | "osm"
  | "maptiler"
  | "stadia"
  | "mapbox"
  | "google";

export interface MapProviderConfig {
  tileUrl: string;
  attribution: string;
  /** Some providers (MapTiler/Mapbox) need an API key interpolated into `tileUrl` as `{apiKey}`. */
  requiresApiKey: boolean;
}

const PROVIDERS: Record<MapProviderKey, MapProviderConfig> = {
  osm: {
    tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    requiresApiKey: false,
  },
  maptiler: {
    tileUrl:
      "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key={apiKey}",
    attribution:
      '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a>',
    requiresApiKey: true,
  },
  stadia: {
    tileUrl:
      "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    requiresApiKey: false,
  },
  mapbox: {
    tileUrl:
      "https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token={apiKey}",
    attribution:
      '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
    requiresApiKey: true,
  },
  google: {
    tileUrl: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    attribution: "&copy; Google",
    requiresApiKey: false,
  },
};

export const DEFAULT_MAP_PROVIDER: MapProviderKey = "osm";

export function getMapProvider(
  key: MapProviderKey = DEFAULT_MAP_PROVIDER,
): MapProviderConfig {
  return PROVIDERS[key] ?? PROVIDERS[DEFAULT_MAP_PROVIDER];
}
