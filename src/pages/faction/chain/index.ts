import "./faction-chain.css";

import Page from "../../page";
import Settings from "../../../utils/local-storage";
import { waitForElement } from "../../../utils/dom";
import Logger from "../../../utils/logger";
import { getTSCSpyOld } from "../../../utils/api";
import { formatNumber } from "../../../utils/format";

const CHAIN_ITEM_SELECTOR = `[class^="warListItem"][class*="first-in-row"]`;
const ATTACK_LIST_SELECTOR = `[class^="chain-attacks-list"]`;
const NAME_SELECTOR = `[class^="honorWrap"]`;

export const FactionChain = new Page({
  name: "Faction - Chain",
  description: "Shows spies on the chain page",

  /**
   TODO: Generalise the selector in case the __eE_Ve part changes
   TODO: Make it run if you visit the chain page directly (this only runs if you visit the faction page first)
   */

  shouldRun: async function () {
    if (
      !Settings.getToggle(this.name) ||
      !window.location.href.includes("factions.php?step=your")
    )
      return false;

    const el = await waitForElement(CHAIN_ITEM_SELECTOR);

    return el !== null;
  },

  start: async function () {
    let updateChainMO: MutationObserver | null = null;

    const chainBig = document.querySelector(CHAIN_ITEM_SELECTOR);

    const observer = new MutationObserver(async (mutations) => {
      if (mutations.length === 0) return;

      const newElement = document.querySelector(CHAIN_ITEM_SELECTOR);

      if (!newElement?.classList.contains("act")) {
        return;
      }

      Logger.debug(`${this.name}: Chain is active`);
      if (updateChainMO !== null) {
        updateChainMO.disconnect();
        updateChainMO = null;
      }

      const attacks = await waitForElement(ATTACK_LIST_SELECTOR, 15_000);

      if (!attacks) {
        Logger.debug(
          `${this.name}: Could not find attacks list (element did not show up in time)`
        );
        return;
      }

      const addAttacks = async () => {
        $(`${ATTACK_LIST_SELECTOR} li`).each(function (_index, element) {
          const users = $(element).find(NAME_SELECTOR);

          for (let i = 0; i <= 1; i++) {
            const u = users[i];

            if ($(u).parent().find(".tsc-chain-spy").length > 0) {
              continue;
            }

            const id = $(u).find("a").attr("href");

            if (!id) {
              Logger.warn(`Faction - Chain: Failed to find ID.`);
              return;
            }

            const userId = id.split("XID=")[1];

            getTSCSpyOld(userId).then((spy) => {
              if ("error" in spy || spy.success !== true) {
                Logger.warn(
                  `Faction - Chain: Failed to find spy for ${userId}`,
                  spy
                );
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
                )}<br>Battle Score: ${formatNumber(
                  statInterval.battleScore,
                  2
                )}`;
              }

              $(u).append(
                $("<div>")
                  .addClass("tsc-chain-spy")
                  .text(spyText)
                  .attr("title", tooltipText)
              );
            });
          }
        });
      };

      updateChainMO = new MutationObserver(async (_mutations) => {
        let redo = false;
        $(`${CHAIN_ITEM_SELECTOR} li`).each(function (_index, element) {
          if (
            $(element).find(".tsc-chain-spy").length === 0 &&
            redo === false
          ) {
            redo = true;
            addAttacks();
          }
        });
      });

      await addAttacks();

      updateChainMO.observe(attacks, {
        childList: true,
        subtree: true,
      });
    });

    if (!chainBig) {
      Logger.error(`${this.name}: Could not find element`);
      return;
    }

    observer.observe(chainBig, {
      attributes: true,
      attributeFilter: ["class"],
    });
  },
});
