import "./faction-normal.css";

import Page from "../../page.js";
import Settings from "../../../utils/local-storage.js";
import { waitForElement } from "../../../utils/dom.js";
import Logger from "../../../utils/logger.js";
import { getTSCSpyOld } from "../../../utils/api.js";
import { formatSpy } from "../../../utils/format.js";

const FIRST_MEMBER_SELECTOR =
  ".faction-info-wrap.restyle.another-faction .table-body > li:nth-child(1)";
const INFO_BOX_SELECTOR = '[class*="userInfoBox"]';
const ID_HREF_SELECTOR = 'a[href^="/profiles.php?XID="]';

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
    const firstMember = await waitForElement(FIRST_MEMBER_SELECTOR, 15_000);

    if (firstMember === null) {
      Logger.warn(`${this.name}: Failed to find element to append to.`);
      return;
    }

    const memberDiv = $(firstMember).parent()[0];

    $(memberDiv)
      .children("li")
      .each((_index, member) => {
        const infoBox = $(member).find<HTMLDivElement>(INFO_BOX_SELECTOR)[0];

        //! This is a bit of a hack, but it works for now
        $(infoBox).css("width", "169px");
        $(infoBox).css("overflow", "hidden");
        $(infoBox).css("text-overflow", "ellipsis");

        if (infoBox === undefined) {
          Logger.debug(
            `${this.name}: Failed to find the player's profile box.`,
            member,
          );
          return;
        }

        const userHref =
          $(infoBox).find<HTMLAnchorElement>(ID_HREF_SELECTOR)[0];

        if (userHref === undefined) {
          Logger.debug(`${this.name}: Failed to find user's ID`, infoBox);
          return;
        }

        const userId = userHref.href.split("XID=")[1];

        getTSCSpyOld(userId).then((spy) => {
          if ("error" in spy || spy.success !== true) {
            Logger.warn(`${this.name}: Failed to find spy for ${userId}`, spy);
            return;
          }

          const { spyText, tooltipText } = formatSpy(spy);

          $(infoBox).after(
            $("<div>")
              .addClass("tsc-faction-spy")
              .text(spyText)
              .attr("title", tooltipText),
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
