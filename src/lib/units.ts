// Pure utility file for unit conversion and formatting

export type Dimension = "WEIGHT" | "VOLUME" | "COUNT";

export const DIMENSIONS: Record<Dimension, string[]> = {
  WEIGHT: ["g", "kg"],
  VOLUME: ["mL", "L"],
  COUNT: ["items"],
};

export const BASE_UNITS: Record<Dimension, string> = {
  WEIGHT: "g",
  VOLUME: "mL",
  COUNT: "items",
};

export const CONVERSION_FACTORS: Record<string, number> = {
  g: 1,
  kg: 1000,
  mL: 1,
  L: 1000,
  items: 1,
};

/**
 * Get conversion factor to base unit for a given unit
 */
export function getConversionFactor(unit: string): number {
  return CONVERSION_FACTORS[unit] ?? 1;
}

/**
 * Convert quantity from a specific unit to its base unit
 * e.g., 2.5 kg -> 2500 g
 */
export function convertToBase(quantity: number, unit: string): number {
  const factor = getConversionFactor(unit);
  return quantity * factor;
}

/**
 * Convert quantity from base unit to a target unit
 * e.g., 2500 g -> 2.5 kg
 */
export function convertFromBase(quantity: number, unit: string): number {
  const factor = getConversionFactor(unit);
  return quantity / factor;
}

/**
 * Calculate the unit price for a target unit given the base price (price per base unit)
 * e.g. base price = ₹0.08 / g, target unit = kg -> unit price = 0.08 * 1000 = ₹80.00 / kg
 */
export function getUnitPriceInTargetUnit(basePricePerBaseUnit: number, unit: string): number {
  const factor = getConversionFactor(unit);
  return basePricePerBaseUnit * factor;
}

/**
 * Format a number as Indian Rupee (INR) amount
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
