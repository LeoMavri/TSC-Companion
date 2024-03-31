import Page from "../page.js";
import Settings from "../../utils/local-storage.js";
import { waitForElement } from "../../utils/dom.js";
import Logger from "../../utils/logger.js";
import { getSpyOld } from "../../utils/api.js";

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
    const emptyBlock = await waitForElement(`.empty-block`);

    if (emptyBlock === null) {
      Logger.warn("Could not find the empty block on the profile page");
      return;
    }

    const userId = window.location.search.split("XID=")[1];
    const key = Settings.getSetting("apiKey");

    if (!key) {
      Logger.warn("No API key found, cannot fetch spy");
      // todo: show a message to the user
      return;
    }

    const spy = await getSpyOld(userId, key);

    if ("error" in spy) {
      Logger.error(spy.message);
      return;
    }

    if (!spy.success) {
      Logger.error(`Failed to fetch spy: ${spy.code}`);
      return;
    }

    // create a table with jquery
  },
});
