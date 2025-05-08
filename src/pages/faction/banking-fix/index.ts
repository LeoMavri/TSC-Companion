import xhook from "xhook";

import { waitForElement } from "../../../utils/dom";
import Page from "../../page.js";

export const FactionBankingFix = new Page({
	name: "Faction - Banking Fix",
	description:
		"Compatibility layer for the rebuilt faction payout page. Toggling this does nothing.",

	shouldRun: async () => {
		return window.location.href.includes("factions.php?step=your");
	},

	start: async () => {
		const element = await waitForElement<HTMLDivElement>(
			`div[id="faction-controls"]`,
			5_000,
		);

		if (!element) return;

		const observer = new MutationObserver(() => {
			if (element.getAttribute("aria-expanded") === "true") {
				xhook.disable();
			} else {
				xhook.enable();
			}
		});

		observer.observe(element, {
			attributes: true,
			attributeFilter: ["aria-expanded"],
		});
	},
});
