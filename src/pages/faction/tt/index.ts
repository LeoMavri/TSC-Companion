import xhook from 'xhook';

import { errorToString, getTSCSpyOld } from '../../../utils/api.js';
import { waitForElement } from '../../../utils/dom.js';
import { formatSpyLong } from '../../../utils/format.js';
import Settings from '../../../utils/local-storage.js';
import Logger from '../../../utils/logger.js';
import Page from '../../page.js';

const ID_HREF_SELECTOR = 'a[href^="/profiles.php?XID="]';
const INFO_BOX_SELECTOR = '[class^="memberRowWp"]';
const MEMBER_SELECTOR = 'div.member.icons.left';

const addStats = async (name: string): Promise<void> => {
  const user = await waitForElement(MEMBER_SELECTOR, 10_000);

  if (!user) {
    Logger.error(`${name}: Could not find users`);
    return;
  }

  $(INFO_BOX_SELECTOR).each((_index, element) => {
    const userHref = $(element).find<HTMLAnchorElement>(ID_HREF_SELECTOR)[0];

    if (!userHref) {
      Logger.error(`${name}: Could not find the user's Href`);
      return;
    }

    const userId = userHref.href.split('XID=')[1];

    if (!userId) {
      Logger.error(`${name}: Could not find the user's ID`);
      return;
    }

    // This isn't ideal, but it should *hopefully* get rid of the racing condition
    if ($(element).find('.tsc-faction-war').length > 0) {
      return;
    }

    Logger.debug(`${name}: Found user ${userId}`);

    const parentDiv = $('<div>').addClass('tsc-faction-war');
    parentDiv.append($('<img>').addClass('tsc-loader'));

    $(element).append(parentDiv);

    getTSCSpyOld(userId).then((spy) => {
      parentDiv.empty();

      if ('error' in spy || spy.success !== true) {
        Logger.warn(`${name}: Failed to find spy for ${userId}`, spy);

        if ('error' in spy) {
          $(parentDiv).append($('<span>').text(spy.message));
        } else {
          $(parentDiv).append($('<span>').text(errorToString(spy.code)));
        }

        return;
      }

      const { longTextInterval, longTextEstimate, toolTipText } = formatSpyLong(spy);

      parentDiv.attr('title', toolTipText).append($('<span>').text(longTextEstimate));

      if (longTextInterval !== '') {
        $(parentDiv).append($('<span>').text(longTextInterval));
      }

      $(element).append(parentDiv);
    });
  });
};

export const FactionTTWar = new Page({
  name: 'Faction - TT War',
  description: 'Shows spies on the faction teritory war page',

  shouldRun: async function () {
    return Settings.getToggle(this.name) && window.location.href.includes('factions.php?step=');
  },

  start: async function () {
    xhook.after(async (request, _response) => {
      if (
        request.url.includes('&step=getwarusers') === false // tt war
      ) {
        return;
      }

      Logger.debug(`${this.name}: Found users request: ${request.url}`);

      await addStats(this.name);
    });

    if (/\/war\/\d+/.test(window.location.href)) {
      await addStats(this.name);
    }
  },
});
