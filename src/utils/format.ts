import type { TscSpy } from "./api.js";

export function formatNumber(number: number | bigint, digits = 2): string {
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
	let tooltipText = `Estimate: ${formatNumber(estimate.stats, 2)} (${dateToRelative(new Date(estimate.lastUpdated))})`;

	if (statInterval?.battleScore) {
		spyText = `${formatNumber(BigInt(statInterval.min), 1)} - ${formatNumber(
			BigInt(statInterval.max),
			1,
		)}`;

		tooltipText += `<br>Interval: ${formatNumber(BigInt(statInterval.min), 2)} - ${formatNumber(
			BigInt(statInterval.max),
			2,
		)} (${dateToRelative(new Date(statInterval.lastUpdated))})<br>Battle Score: ${formatNumber(statInterval.battleScore, 2)}`;
	}

	return { spyText, tooltipText };
}

export function formatSpyLong(spy: TscSpy): {
	longTextInterval: string;
	longTextEstimate: string;
	toolTipText: string;
} {
	const { estimate, statInterval } = spy.spy;

	let longTextInterval = "";
	const longTextEstimate = `Estimate: ${formatNumber(estimate.stats)}`;
	let toolTipText = `Estimate: ${new Date(estimate.lastUpdated).toLocaleDateString()}`;

	if (statInterval?.battleScore) {
		longTextInterval = `${formatNumber(BigInt(statInterval.min))} - ${formatNumber(
			BigInt(statInterval.max),
		)} / FF: ${statInterval.fairFight}`;
		toolTipText += `<br>Interval: ${new Date(statInterval.lastUpdated).toLocaleDateString()}`;
	}

	return { longTextInterval, longTextEstimate, toolTipText };
}

export function dateToRelative(date: Date): string {
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	if (diff < 0) return "in the future";

	const minutes = Math.floor(diff / (1000 * 60));
	if (minutes < 1) return "just now";

	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(months / 12);

	if (years > 0) {
		const remainingMonths = months % 12;
		let result = `${years} year${years !== 1 ? "s" : ""}`;
		if (remainingMonths > 0) {
			result += `, ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
		}
		return result;
	}

	if (months > 0) {
		const remainingDays = days % 30;
		let result = `${months} month${months !== 1 ? "s" : ""}`;
		if (remainingDays > 0) {
			result += `, ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`;
		}
		return result;
	}

	if (days > 0) {
		const remainingHours = hours % 24;
		let result = `${days} day${days !== 1 ? "s" : ""}`;
		if (remainingHours > 0) {
			result += `, ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
		}
		return result;
	}

	if (hours > 0) {
		const remainingMinutes = minutes % 60;
		let result = `${hours} hour${hours !== 1 ? "s" : ""}`;
		if (remainingMinutes > 0) {
			result += `, ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
		}
		return result;
	}

	return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}
