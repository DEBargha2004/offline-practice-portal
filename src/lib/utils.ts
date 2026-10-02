export { cn } from "cn";

/**
 * Rounds a number to a specified number of decimal positions (default 1) using standard rounding.
 */
export function rounded(value: number | string | undefined | null, pos: number = 1): number {
  if (value === undefined || value === null) return 0;
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (typeof num !== "number" || isNaN(num)) return 0;
  const factor = Math.pow(10, pos);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Formats a score up to `pos` decimal places after rounding (e.g. 5 -> "5", 5.25 -> "5.3", 5.2 -> "5.2").
 */
export function formatScore(value: number | string | undefined | null, pos: number = 1): string {
  if (value === undefined || value === null) return "0";
  return rounded(value, pos).toString();
}
