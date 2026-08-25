/**
 * Money utility for safe financial arithmetic using integer cents.
 *
 * Standard JavaScript floating-point arithmetic can produce precision errors
 * (e.g. 0.1 + 0.2 = 0.30000000000000004). This utility converts all values
 * to integer pence (cents) before performing arithmetic, then converts back.
 *
 * All monetary values in this application are represented in GBP (£).
 */

/**
 * Converts a decimal GBP amount to integer pence, rounding to the nearest penny.
 * Example: 20.50 -> 2050, 0.10 -> 10
 */
export function toPence(gbp: number): number {
  return Math.round(gbp * 100);
}

/**
 * Converts integer pence back to decimal GBP, rounded to 2 decimal places.
 * Example: 2050 -> 20.50, 10 -> 0.10
 */
export function toGbp(pence: number): number {
  return Math.round(pence) / 100;
}

/**
 * Safely multiplies a count by a per-unit GBP amount and returns the result in GBP.
 * Internally converts to pence to avoid floating-point drift.
 *
 * Example: multiplyGbp(50, 0.10) -> 5.00 (not 5.000000000000001)
 */
export function multiplyGbp(count: number, perUnitGbp: number): number {
  return toGbp(count * toPence(perUnitGbp));
}

/**
 * Safely adds two or more GBP amounts and returns the result in GBP.
 * Internally converts to pence to avoid floating-point drift.
 *
 * Example: addGbp(20.00, 5.00) -> 25.00
 */
export function addGbp(...amounts: number[]): number {
  const totalPence = amounts.reduce((sum, amount) => sum + toPence(amount), 0);
  return toGbp(totalPence);
}

/**
 * Safely subtracts one or more GBP amounts from a base amount.
 * Internally converts to pence to avoid floating-point drift.
 *
 * Example: subtractGbp(25.00, 5.00) -> 20.00
 */
export function subtractGbp(base: number, ...amounts: number[]): number {
  const basePence = toPence(base);
  const deductionPence = amounts.reduce(
    (sum, amount) => sum + toPence(amount),
    0,
  );
  return toGbp(basePence - deductionPence);
}

/**
 * Calculates a percentage of a GBP amount safely.
 * Internally uses pence to avoid floating-point drift.
 *
 * Example: percentOfGbp(25.00, 20) -> 5.00 (20% of £25)
 */
export function percentOfGbp(amount: number, percent: number): number {
  const pence = toPence(amount);
  // Use Math.round to get nearest penny
  return toGbp(Math.round((pence * percent) / 100));
}
