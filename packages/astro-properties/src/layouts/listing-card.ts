import type { Price } from "../schema.js";

export interface ListingCard {
  href: string;
  title: string;
  price: Price;
  coverImageSrc: string;
  coverImageAlt: string;
  bedrooms?: number | undefined;
  bathrooms?: number | undefined;
  areaSize?: number | undefined;
  areaUnit?: "sqft" | "sqm" | undefined;
  labels?: string[] | undefined;
}
