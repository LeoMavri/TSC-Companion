import './attack.css';

import { getTSCSpyOld } from '../../utils/api.js';
import { waitForElement } from '../../utils/dom.js';
import { formatSpy } from '../../utils/format.js';
import Settings from '../../utils/local-storage.js';
import Logger from '../../utils/logger.js';
import Page from '../page.js';

const ENEMY_NAME_SELECTOR = '[class*="user-name"]';

export const AttackPage = new Page({
  name: 'Attack Page',
  description: `Shows a user's spy on their attack page`,

  shouldRun: async function () {
    return Settings.getToggle(this.name) && window.location.pathname === '/loader.php';
  },

  start: async function () {
    const localUserName = await waitForElement(ENEMY_NAME_SELECTOR);

    if (localUserName === null) {
      Logger.debug('Could not find local name element');
      return;
    }

    const enemyId = new URLSearchParams(window.location.search).get('user2ID');

    if (enemyId === null) {
      Logger.debug('Could not find enemy ID');
      return;
    }

    getTSCSpyOld(enemyId).then((spy) => {
      if ('error' in spy || spy.success !== true) {
        Logger.warn(`${this.name}: Failed to find spy for ${enemyId}`, spy);
        return;
      }

      const { spyText, tooltipText } = formatSpy(spy);

      $(ENEMY_NAME_SELECTOR)
        .eq(1)
        .addClass('tsc-attack-mobile') // just makes sure the estimate always shows up all the way to the left
        .after(
          $('<div>')
            .addClass('tsc-attack-spy')
            .addClass('left')
            .text(spyText)
            .attr('title', tooltipText)
        );
    });
  },
});
