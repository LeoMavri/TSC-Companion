import "./style.css";
import Logger from "./utils/logger.js";
import * as Features from "./pages/index.js";
import { SettingsPanel } from "./pages/index.js";
import Settings from "./utils/local-storage.js";

async function main() {
  if ((await SettingsPanel.shouldRun()) === true) {
    Logger.info("Settings panel feature started");
    await SettingsPanel.start();
  }

  if (Settings.getToggle("enable") === false) {
    Logger.info("TSC is disabled");
    return;
  }

  Logger.info("Starting TSC features...");

  if (Settings)
    for (const Feature of Object.values(Features)) {
      if ((await Feature.shouldRun()) === false) {
        Logger.info(`${Feature.name} feature not applicable`);
        continue;
      }

      try {
        await Feature.start();
        Logger.info(`${Feature.name} feature started`);
      } catch (err) {
        Logger.error(`Failed to start ${Feature.name} feature:`, err);
      }
    }
}

main().catch((err) => {
  Logger.error("TSC failed catastrophically:", err);
});
