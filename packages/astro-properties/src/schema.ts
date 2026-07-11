import { z } from "zod";

export const ListingType = z.enum(["sale", "rent"]);
export type ListingType = z.infer<typeof ListingType>;

export const Category = z.enum([
  "residential",
  "commercial",
  "land",
  "rural",
  "student",
  "short-term",
]);
export type Category = z.infer<typeof Category>;

export const PropertyStatus = z.enum([
  "for-sale",
  "for-rent",
  "sold",
  "rented",
  "under-offer",
  "coming-soon",
  "off-market",
]);
export type PropertyStatus = z.infer<typeof PropertyStatus>;

export const PropertyType = z.enum([
  "apartment",
  "condominium",
  "house",
  "villa",
  "townhouse",
  "studio",
  "land",
  "office",
  "retail",
  "warehouse",
  "industrial",
  "new-development",
  "other",
]);
export type PropertyType = z.infer<typeof PropertyType>;

export const Tenure = z.enum([
  "freehold",
  "leasehold",
  "share-of-freehold",
  "commonhold",
  "other",
]);
export type Tenure = z.infer<typeof Tenure>;

export const PriceSchema = z
  .object({
    amount: z.number().nonnegative().optional(),
    currency: z.string().default("USD"),
    onRequest: z.boolean().default(false),
    prefixLabel: z.string().optional(),
    suffixLabel: z.string().optional(),
    period: z.enum(["month", "week", "night", "year", "pppw"]).optional(),
    deposit: z.number().optional(),
    secondAmount: z.number().optional(),
  })
  .refine((price) => price.onRequest || price.amount != null, {
    message: "price.amount is required unless onRequest is true",
    path: ["amount"],
  });
export type Price = z.infer<typeof PriceSchema>;

export const LocationSchema = z.object({
  address: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string(),
  area: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  zoom: z.number().int().min(1).max(20).default(14),
  hideExact: z.boolean().default(false),
});
export type Location = z.infer<typeof LocationSchema>;

export const EnergySchema = z.object({
  class: z.string().optional(),
  epcCurrent: z.number().min(0).max(100).optional(),
  epcPotential: z.number().min(0).max(100).optional(),
});
export type Energy = z.infer<typeof EnergySchema>;

export const FloorPlanSchema = z.object({
  title: z.string(),
  image: z.string(),
  size: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  price: z.number().optional(),
  description: z.string().optional(),
});
export type FloorPlan = z.infer<typeof FloorPlanSchema>;

const UnitSchema = z.object({
  title: z.string(),
  price: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  size: z.number().optional(),
  available: z.date().optional(),
});

/**
 * Base property schema without Astro-specific `image()`/`reference()` fields,
 * so it can be unit-tested without loading the `astro:content` runtime.
 * The content-collection schema (`propertiesCollectionSchema` in
 * `content.ts`) wraps this with `image()`/`reference()` support.
 */
export const propertyBaseSchema = z.object({
  title: z.string(),
  propertyId: z.string().optional(),
  listingType: ListingType,
  category: Category.default("residential"),
  status: PropertyStatus,
  type: PropertyType,
  tenure: Tenure.optional(),
  labels: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  price: PriceSchema,
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  rooms: z.number().int().optional(),
  areaSize: z.number().optional(),
  areaUnit: z.enum(["sqft", "sqm"]).default("sqm"),
  landArea: z.number().optional(),
  landUnit: z.enum(["sqft", "sqm", "acre", "rai"]).optional(),
  parking: z.array(z.string()).default([]),
  yearBuilt: z.number().int().optional(),
  floorLevel: z.number().int().optional(),
  amenities: z.array(z.string()).default([]),
  additionalRooms: z.array(z.string()).default([]),
  custom: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
  location: LocationSchema,
  energy: EnergySchema.optional(),
  floorPlans: z.array(FloorPlanSchema).default([]),
  videoUrl: z.url().optional(),
  virtualTourUrl: z.url().optional(),
  brochure: z.string().optional(),
  units: z.array(UnitSchema).default([]),
  publishedAt: z.date().optional(),
  expiresAt: z.date().optional(),
});
export type PropertyBase = z.infer<typeof propertyBaseSchema>;

export const agentSchema = z.object({
  name: z.string(),
  photo: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  email: z.email().optional(),
  whatsapp: z.string().optional(),
  socials: z.record(z.string(), z.url()).default({}),
  bio: z.string().optional(),
  license: z.string().optional(),
});
export type Agent = z.infer<typeof agentSchema>;

export const agencySchema = z.object({
  name: z.string(),
  logo: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.email().optional(),
});
export type Agency = z.infer<typeof agencySchema>;

export const officeSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.email().optional(),
});
export type Office = z.infer<typeof officeSchema>;
