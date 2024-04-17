import { TscSpy } from "./api.js";

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

export function formatSpy(spy: TscSpy): {
  spyText: string;
  tooltipText: string;
} {
  const { estimate, statInterval } = spy.spy;

  let spyText = formatNumber(estimate.stats, 1);
  let tooltipText = `Estimate: ${formatNumber(estimate.stats, 2)}`;

  if (statInterval?.battleScore) {
    spyText = `${formatNumber(BigInt(statInterval.min), 1)} - ${formatNumber(
      BigInt(statInterval.max),
      1
    )}`;

    tooltipText += `<br>Interval: ${formatNumber(
      BigInt(statInterval.min),
      2
    )} - ${formatNumber(
      BigInt(statInterval.max),
      2
    )}<br>Battle Score: ${formatNumber(statInterval.battleScore, 2)}`;
  }

  return { spyText, tooltipText };
}
