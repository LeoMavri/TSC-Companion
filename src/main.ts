import './style.css';
import * as Features from './pages/index.js';
import { SettingsPanel } from './pages/settings/index.js';
import Settings from './utils/local-storage.js';
import Logger from './utils/logger.js';

async function main(): Promise<void> {
  if ((await SettingsPanel.shouldRun()) === true) {
    Logger.info('Settings panel initialized');
    await SettingsPanel.start();
  }

  if (Settings.getToggle('enabled') === false) {
    Logger.info('TSC is disabled');
    return;
  }

  Logger.info('Starting TSC features...');

  for (const Feature of Object.values(Features)) {
    if ((await Feature.shouldRun()) === false) {
      continue;
    }

    try {
      await Feature.start();
      Logger.info(`'${Feature.name}' started`);
    } catch (err) {
      Logger.error(`Failed to start '${Feature.name}'`, err);
    }
  }
}

main().catch(err => {
  Logger.error('TSC failed catastrophically:', err);
});
