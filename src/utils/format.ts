export function formatNumber(number: number | bigint): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(number);
}
