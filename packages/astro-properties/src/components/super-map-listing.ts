import type { Price } from "../schema.js";

export interface SuperMapListing {
  id: string;
  href: string;
  title: string;
  price: Price;
  lat: number;
  lng: number;
}
