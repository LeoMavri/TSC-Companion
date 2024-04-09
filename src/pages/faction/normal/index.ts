import "./faction-normal.css";

import Page from "../../page";
import Settings from "../../../utils/local-storage";
import { waitForElement } from "../../../utils/dom";
import Logger from "../../../utils/logger";
import { getTSCSpyOld } from "../../../utils/api";
import { formatNumber } from "../../../utils/format";

export const FactionNormal = new Page({
  name: "Faction - Normal",
  description: "Shows a list of spies on the faction page",

  shouldRun: async function () {
    return (
      Settings.getToggle(this.name) &&
      window.location.href.includes("factions.php?step=profile")
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

    $(memberDiv)
      .find<HTMLLIElement>("li")
      .each((_index, member) => {
        const infoBox = $(member).find<HTMLDivElement>(
          `[class*="userInfoBox"]`
        )[0];

        //! This is a bit of a hack, but it works for now
        $(infoBox).css("width", "157px");

        if (infoBox === undefined) {
          Logger.warn("Failed to find infoBox", member);
          return;
        }

        const userHref = $(infoBox).find<HTMLAnchorElement>(
          'a[href^="/profiles.php?XID="]'
        )[0];

        if (userHref === undefined) {
          Logger.warn("Failed to find userHref", infoBox);
          return;
        }

        const userId = userHref.href.split("XID=")[1];

        getTSCSpyOld(userId).then((spy) => {
          if ("error" in spy || spy.success !== true) {
            Logger.warn(`Failed to find spy for ${userId}`, spy);
            return;
          }

          const { estimate, statInterval } = spy.spy;

          let spyText = formatNumber(estimate.stats, 1);
          let tooltipText = `Estimate: ${formatNumber(estimate.stats, 2)}`;

          if (statInterval?.battleScore) {
            spyText = `${formatNumber(
              BigInt(statInterval.min),
              1
            )} - ${formatNumber(BigInt(statInterval.max), 1)}`;

            tooltipText += `<br>Interval: ${formatNumber(
              BigInt(statInterval.min),
              2
            )} - ${formatNumber(
              BigInt(statInterval.max),
              2
            )}<br>Battle Score: ${formatNumber(statInterval.battleScore, 2)}`;
          }

          $(infoBox).after(
            $("<div>")
              .addClass("tsc-faction-spy")
              .text(spyText)
              .attr("title", tooltipText)
          );
        });
      });
  },
});

// TODO: Eventually make this a new column with sorting etc. etc.
// const header = $(memberDiv).find("li[role='heading']")[0];
// $(header).after(
//   $("<li>")
//     .addClass("table-cell")
//     .append(
//       $("<div>")
//         .addClass("table-cell c-pointer divider-vertical torn-divider")
//         .text("Spy")
//         .css("font-weight", "bold")
//     )
// );
