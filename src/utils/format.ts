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

export function dateToRelative(date: Date): string {
  const diff = new Date().getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    const remainingMonths = months % 12;
    return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  } else if (months > 0) {
    const remainingDays = days % 30;
    return `${months} month${months > 1 ? 's' : ''}, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  } else if (days > 0) {
    const remainingHours = hours % 24;
    return `${days} day${days > 1 ? 's' : ''}, ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''}, ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}
