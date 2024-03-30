import "./style.css";
import Logger from "./utils/logger.js";
import * as Features from "./pages/index.js";

async function main() {
  for (const entry of Object.values(Features)) {
    const Feature = new entry();

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
