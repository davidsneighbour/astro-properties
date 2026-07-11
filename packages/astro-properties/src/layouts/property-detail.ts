import type { LightboxImage } from "../lib/lightbox.js";
import type { Agent, Location, Price } from "../schema.js";

export interface PropertyDetail {
  title: string;
  description?: string | undefined;
  url: string;
  price: Price;
  bedrooms?: number | undefined;
  bathrooms?: number | undefined;
  areaSize?: number | undefined;
  areaUnit?: "sqft" | "sqm" | undefined;
  amenities: string[];
  location: Location;
  images: LightboxImage[];
  agent?: Agent | undefined;
}
