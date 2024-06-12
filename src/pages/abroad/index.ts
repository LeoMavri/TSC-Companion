import './abroad.css';

import { getTSCSpyOld } from '../../utils/api.js';
import { waitForElement } from '../../utils/dom.js';
import { formatSpy } from '../../utils/format.js';
import Settings from '../../utils/local-storage.js';
import Logger from '../../utils/logger.js';
import Page from '../page.js';

const ABROAD_USER_LIST_SELECTOR = 'ul[class^="users-list"]';
const ID_HREF_SELECTOR = 'a[href^="/profiles.php?XID="]';

export const AbroadPage = new Page({
  name: 'Abroad Page',
  description: `Shows user spies on the abroad people's page`,

  shouldRun: async function () {
    return (
      Settings.getToggle(this.name) &&
      window.location.pathname === '/index.php' &&
      window.location.search.includes('?page=people')
    );
  },

  start: async function () {
    const users = await waitForElement(ABROAD_USER_LIST_SELECTOR, 15_000);
    if (users === null) {
      Logger.warn(`${this.name}: Failed to find element to append to.`);
      return;
    }

    Logger.debug(`${this.name}: Found users`, users);

    $(users)
      .children('li')
      .each((_index, user) => {
        const userAnchor = $(user).find<HTMLAnchorElement>(ID_HREF_SELECTOR)[0];

        if (userAnchor === undefined) {
          Logger.debug(`${this.name}: Failed to find user's ID`, user);
          return;
        }

        const id = userAnchor.href.split('XID=')[1];

        Logger.debug(`${this.name}: Found user ID`, id);

        getTSCSpyOld(id).then((spy) => {
          if ('error' in spy || spy.success !== true) {
            Logger.warn(`${this.name}: Failed to find spy for ${id}`, spy);
            return;
          }

          const { spyText, tooltipText } = formatSpy(spy);

          $(userAnchor).append(
            $('<div>')
              .addClass('tsc-abroad-spy')
              .text(spyText)
              .attr('title', tooltipText)
              .css('font-size', '0.8em')
          );
        });
      });
  },
});
