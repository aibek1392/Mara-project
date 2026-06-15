import type { ProductCategory } from "../types";

export interface CategoryFieldDef {
  key: string;
  labelKey: string;
  type: "text" | "number";
}

export const CATEGORY_FIELDS: Record<ProductCategory, CategoryFieldDef[]> = {
  electronics: [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "model", labelKey: "model", type: "text" },
    { key: "warranty", labelKey: "warranty", type: "text" },
  ],
  computers: [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "processor", labelKey: "processor", type: "text" },
    { key: "ram", labelKey: "ram", type: "text" },
    { key: "storage", labelKey: "storage", type: "text" },
  ],
  books: [
    { key: "author", labelKey: "author", type: "text" },
    { key: "publisher", labelKey: "publisher", type: "text" },
    { key: "pages", labelKey: "pages", type: "number" },
    { key: "language", labelKey: "language", type: "text" },
  ],
  clothing: [
    { key: "material", labelKey: "material", type: "text" },
    { key: "care", labelKey: "care", type: "text" },
    { key: "season", labelKey: "season", type: "text" },
  ],
  "home-kitchen": [
    { key: "material", labelKey: "material", type: "text" },
    { key: "capacity", labelKey: "capacity", type: "text" },
    { key: "power", labelKey: "power", type: "text" },
  ],
  "sports-outdoors": [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "activity", labelKey: "activity", type: "text" },
    { key: "material", labelKey: "material", type: "text" },
  ],
  beauty: [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "volume", labelKey: "volume", type: "text" },
    { key: "skinType", labelKey: "skinType", type: "text" },
  ],
  "toys-games": [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "ageRange", labelKey: "ageRange", type: "text" },
    { key: "players", labelKey: "players", type: "text" },
  ],
  grocery: [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "weight", labelKey: "weight", type: "text" },
    { key: "expiry", labelKey: "expiry", type: "text" },
  ],
  automotive: [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "compatibility", labelKey: "compatibility", type: "text" },
    { key: "partNumber", labelKey: "partNumber", type: "text" },
  ],
  garden: [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "plantType", labelKey: "plantType", type: "text" },
    { key: "season", labelKey: "season", type: "text" },
  ],
  health: [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "dosage", labelKey: "dosage", type: "text" },
    { key: "form", labelKey: "form", type: "text" },
  ],
  "pet-supplies": [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "petType", labelKey: "petType", type: "text" },
    { key: "weight", labelKey: "weight", type: "text" },
  ],
  office: [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "paperSize", labelKey: "paperSize", type: "text" },
    { key: "quantity", labelKey: "packQuantity", type: "text" },
  ],
  jewelry: [
    { key: "material", labelKey: "material", type: "text" },
    { key: "gemstone", labelKey: "gemstone", type: "text" },
    { key: "gender", labelKey: "gender", type: "text" },
  ],
  baby: [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "ageRange", labelKey: "ageRange", type: "text" },
    { key: "material", labelKey: "material", type: "text" },
  ],
  "movies-music": [
    { key: "format", labelKey: "format", type: "text" },
    { key: "genre", labelKey: "genre", type: "text" },
    { key: "language", labelKey: "language", type: "text" },
  ],
  tools: [
    { key: "brand", labelKey: "brand", type: "text" },
    { key: "power", labelKey: "power", type: "text" },
    { key: "voltage", labelKey: "voltage", type: "text" },
  ],
};
