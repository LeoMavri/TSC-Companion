import './profile.css';

import { getTSCSpyOld } from '../../utils/api.js';
import { waitForElement } from '../../utils/dom.js';
import { formatNumber } from '../../utils/format.js';
import Settings from '../../utils/local-storage.js';
import Logger from '../../utils/logger.js';
import Page from '../page.js';

/**
TODO: Properly tell the user that fetching the spy failed, give the reason as well (wrong API key, etc)
 */

const SPY_BLOCK_SELECTOR = '.empty-block';

export const ProfilePage = new Page({
  name: 'Profile Page',
  description: `Shows a user's spy on their profile page`,

  shouldRun: async function () {
    return Settings.getToggle(this.name) && window.location.pathname === '/profiles.php';
  },

  start: async function () {
    const emptyBlock = await waitForElement(SPY_BLOCK_SELECTOR, 15_000);

    if (emptyBlock === null) {
      Logger.warn(`${this.name}: Could not find the empty block on the profile page`);
      return;
    }

    const userId = window.location.search.split('XID=')[1];
    const spy = await getTSCSpyOld(userId);

    if ('error' in spy || spy.success !== true) {
      Logger.error(`${this.name}: Failed to fetch spy`, spy);
      return;
    }

    const { estimate, statInterval } = spy.spy;

    $(emptyBlock).append(
      $('<table>')
        .addClass('tsc-stat-table')
        .attr(
          'title',
          `Inteval: ${
            statInterval?.lastUpdated ? new Date(statInterval.lastUpdated).toLocaleString() : 'N/A'
          }<br>Estimate: ${new Date(estimate.lastUpdated).toLocaleString()}<br>Cache: ${new Date(
            spy.insertedAt
          ).toLocaleString()}`
        )
        .append(
          $('<tr>')
            .append($('<th>').text('Estimated Stats'))
            .append($('<th>').text('Min'))
            .append($('<th>').text('Max'))
            .append($('<th>').text('Battle Score'))
            .append($('<th>').text('Fair Fight'))
        )
        .append(
          $('<tr>')
            .append($('<td>').text(formatNumber(BigInt(estimate.stats))))
            .append(
              $('<td>').text(
                statInterval?.battleScore ? formatNumber(BigInt(statInterval.min)) : 'N/A'
              )
            )
            .append(
              $('<td>').text(
                statInterval?.battleScore ? formatNumber(BigInt(statInterval.max)) : 'N/A'
              )
            )
            .append(
              $('<td>').text(
                statInterval?.battleScore ? formatNumber(statInterval.battleScore) : 'N/A'
              )
            )
            .append($('<td>').text(statInterval?.battleScore ? statInterval.fairFight : 'N/A'))
        )
    );
  },
});
