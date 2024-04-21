import { TscSpy } from './api.js';

export function formatNumber(number: number | bigint, digits: number = 2): string {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
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

    tooltipText += `<br>Interval: ${formatNumber(BigInt(statInterval.min), 2)} - ${formatNumber(
      BigInt(statInterval.max),
      2
    )}<br>Battle Score: ${formatNumber(statInterval.battleScore, 2)}`;
  }

  return { spyText, tooltipText };
}

export function formatSpyLong(spy: TscSpy): {
  longTextInterval: string;
  longTextEstimate: string;
  toolTipText: string;
} {
  const { estimate, statInterval } = spy.spy;

  let longTextInterval = '';
  let longTextEstimate = `Estimate: ${formatNumber(estimate.stats)}`;
  let toolTipText = `Estimate: ${new Date(estimate.lastUpdated).toLocaleDateString()}`;

  if (statInterval?.battleScore) {
    longTextInterval = `${formatNumber(BigInt(statInterval.min))} - ${formatNumber(
      BigInt(statInterval.max)
    )} / FF: ${statInterval.fairFight}`;
    toolTipText += `<br>Interval: ${new Date(statInterval.lastUpdated).toLocaleDateString()}`;
  }

  return { longTextInterval, longTextEstimate, toolTipText };
}
