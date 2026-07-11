import type {
  Category,
  Price,
  PropertyStatus,
  PropertyType,
} from "../schema.js";

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
  /** Used to prep `data-pagefind-filter` attributes now, so Phase 2 search is a drop-in later. */
  type: PropertyType;
  status: PropertyStatus;
  category: Category;
}
