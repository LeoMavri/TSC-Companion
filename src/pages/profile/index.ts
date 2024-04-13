import "./profile.css";
import Page from "../page.js";
import Settings from "../../utils/local-storage.js";
import Logger from "../../utils/logger.js";
import { waitForElement } from "../../utils/dom.js";
import { getTSCSpyOld } from "../../utils/api.js";
import { formatNumber } from "../../utils/format";

export const ProfilePage = new Page({
  name: "Profile Page",
  description: "Shows a user's spy on their profile page",

  shouldRun: async function () {
    return (
      Settings.getToggle(this.name) &&
      window.location.pathname === "/profiles.php"
    );
  },

  start: async () => {
    const emptyBlock = await waitForElement(`.empty-block`, 15_000);

    if (emptyBlock === null) {
      Logger.warn("Could not find the empty block on the profile page");
      return;
    }

    const userId = window.location.search.split("XID=")[1];
    const key = Settings.get("api-key");

    if (!key) {
      Logger.warn("No API key found, cannot fetch spy");
      // todo: show a message to the user
      return;
    }

    const spy = await getTSCSpyOld(userId);

    if ("error" in spy) {
      Logger.error(spy.message);
      return;
    }

    if (!spy.success) {
      Logger.error(`Failed to fetch spy: ${spy.code}`);
      return;
    }

    const { estimate, statInterval } = spy.spy;

    $(emptyBlock).append(
      $("<table>")
        .addClass("tsc-stat-table")
        .append(
          $("<tr>")
            .append($("<th>").text("Estimated Stats"))
            .append($("<th>").text("Min"))
            .append($("<th>").text("Max"))
            .append($("<th>").text("Battle Score"))
        )
        .append(
          $("<tr>")
            .append($("<td>").text(formatNumber(BigInt(estimate.stats))))
            .append(
              $("<td>").text(
                statInterval?.battleScore
                  ? formatNumber(BigInt(statInterval.min))
                  : "N/A"
              )
            )
            .append(
              $("<td>").text(
                statInterval?.battleScore
                  ? formatNumber(BigInt(statInterval.max))
                  : "N/A"
              )
            )
            .append(
              $("<td>").text(
                statInterval?.battleScore ? statInterval.battleScore : "N/A"
              )
            )
        )
    );
  },
});
