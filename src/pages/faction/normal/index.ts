import "./faction-normal.css";

import Page from "../../page";
import Settings from "../../../utils/local-storage";
import { waitForElement } from "../../../utils/dom";
import Logger from "../../../utils/logger";
// import { getSpyOld } from "../../../utils/api";

export const FactionNormal = new Page({
  name: "Faction - Normal",
  description: "Shows a list of spies on the faction page",

  shouldRun: async function () {
    return (
      Settings.getToggle(this.name) &&
      window.location.href.includes("factions.php?step=profile&ID=")
    );
  },

  start: async function () {
    const firstMember = await waitForElement(
      `.faction-info-wrap.restyle.another-faction .table-body > li:nth-child(1)`,
      15_000
    );

    if (firstMember === null) {
      Logger.warn(`${this.name}: Failed to find element to append to.`);
      return;
    }

    const memberDiv = $(firstMember).parent().parent()[0];

    Logger.debug(`Member Div:`, memberDiv);

    const header = $(memberDiv).find("li[role='heading']")[0];

    Logger.debug(`Header:`, header);

    $(header).after(
      $("<li>")
        .addClass("table-cell")
        .append(
          $("<div>")
            .addClass("table-cell c-pointer divider-vertical torn-divider")
            .text("Spy")
            .css("font-weight", "bold")
        )
    );
  },
});
