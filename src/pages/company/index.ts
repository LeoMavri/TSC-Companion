import "./company.css";

import Page from "../page.js";
import Settings from "../../utils/local-storage.js";
import Logger from "../../utils/logger.js";
import { waitForElement } from "../../utils/dom.js";
import { getTSCSpyOld } from "../../utils/api.js";
import { formatSpy } from "../../utils/format.js";

const COMPANY_MEMBERS_SELECTOR = `#mainContainer > div.content-wrapper.spring > div.employees-wrap > ul`;
const ID_HREF_SELECTOR = 'a[href^="/profiles.php?XID="]';

export const CompanyPage = new Page({
  name: "Company Page",
  description: "Shows a user spies on the company page",

  shouldRun: async function () {
    return (
      Settings.getToggle(this.name) &&
      window.location.pathname === "/joblist.php" &&
      window.location.hash.includes("p=corpinfo")
    );
  },

  start: async function () {
    const users = await waitForElement(COMPANY_MEMBERS_SELECTOR, 15_000);

    if (users === null) {
      Logger.warn(`${this.name}: Failed to find element to append to.`);
      return;
    }

    Logger.debug(`${this.name}: Found users`, users);

    $(users)
      .children("li")
      .each((_index, user) => {
        const userAnchor = $(user).find<HTMLAnchorElement>(ID_HREF_SELECTOR)[0];

        if (userAnchor === undefined) {
          Logger.debug(`${this.name}: Failed to find user's ID`, user);
          return;
        }

        const id = userAnchor.href.split("XID=")[1];

        Logger.debug(`${this.name}: Found user ID`, id);

        getTSCSpyOld(id).then((spy) => {
          if ("error" in spy || spy.success !== true) {
            Logger.warn(`${this.name}: Failed to find spy for ${id}`, spy);
            return;
          }

          const { spyText, tooltipText } = formatSpy(spy);

          $(userAnchor).after(
            $("<div>")
              .addClass("tsc-company-spy")
              .text(spyText)
              .attr("title", tooltipText)
          );
        });
      });
  },
});
