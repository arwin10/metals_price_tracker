/**
 * Weight conversion utilities for precious metals
 * Base unit: Troy Ounce (oz)
 */

export type WeightUnit = 'oz' | 'kg' | '10g' | '1g';

export const UNIT_LABELS: Record<WeightUnit, string> = {
  oz: 'per Troy Oz',
  kg: 'per Kilogram',
  '10g': 'per 10 Grams',
  '1g': 'per Gram',
};

export const UNIT_LABELS_SHORT: Record<WeightUnit, string> = {
  oz: 'Troy Oz',
  kg: 'kg',
  '10g': '10g',
  '1g': 'g',
};

/**
 * Conversion factors from troy ounce to other units
 * 1 troy ounce = 31.1035 grams
 * 1 kilogram = 1000 grams = 32.1507 troy ounces
 */
export const UNIT_CONVERSIONS: Record<WeightUnit, number> = {
  oz: 1,           // 1 troy oz = 1 troy oz
  kg: 32.1507,     // 1 kg = 32.1507 troy oz
  '10g': 0.32151,  // 10g = 0.32151 troy oz
  '1g': 0.032151,  // 1g = 0.032151 troy oz
};

/**
 * Convert price from troy ounce to specified unit
 * @param pricePerOz Price per troy ounce
 * @param unit Target weight unit
 * @returns Converted price
 */
export function convertPrice(pricePerOz: number, unit: WeightUnit): number {
  return pricePerOz * UNIT_CONVERSIONS[unit];
}

/**
 * Format weight unit for display
 * @param unit Weight unit
 * @param short Use short label
 * @returns Formatted unit label
 */
export function formatUnitLabel(unit: WeightUnit, short: boolean = false): string {
  return short ? UNIT_LABELS_SHORT[unit] : UNIT_LABELS[unit];
}
