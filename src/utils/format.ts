export function formatNumber(
  number: number | bigint,
  digits: number = 2
): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(number);
}
