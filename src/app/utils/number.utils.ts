/** Round to one decimal place (used for kilometre sums). */
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
