import './faction-chain.css';

import xhook from 'xhook';

import { getTSCSpyOld } from '../../../utils/api.js';
import { waitForElement } from '../../../utils/dom.js';
import { formatSpy } from '../../../utils/format.js';
import Settings from '../../../utils/local-storage.js';
import Logger from '../../../utils/logger.js';
import Page from '../../page.js';

const CHAIN_ITEM_SELECTOR = '[class^="warListItem"][class*="first-in-row"]';
const ATTACK_LIST_SELECTOR = '[class^="chain-attacks-list"]';
const NAME_SELECTOR = '[class^="honorWrap"]';

const addStats = async (): Promise<void> => {
  $(`${ATTACK_LIST_SELECTOR} li`).each(function (_index: number, element: HTMLElement) {
    const users = $(element).find(NAME_SELECTOR);

    for (let i = 0; i <= 1; i++) {
      const u = users[i];
      const id = $(u).find('a').attr('href');

      if (!id) {
        Logger.warn('Faction - Chain: Failed to find ID.');
        return;
      }

      const userId = id.split('XID=')[1];

      getTSCSpyOld(userId).then(spy => {
        if ('error' in spy || spy.success !== true) {
          Logger.warn(`Faction - Chain: Failed to find spy for ${userId}`, spy);
          return;
        }

        const { spyText, tooltipText } = formatSpy(spy);
        // I know this technically wastes a call, but it seems it only works like this

        if ($(u).find('.tsc-chain-spy').length > 0) {
          return;
        }

        $(u).append($('<div>').addClass('tsc-chain-spy').text(spyText).attr('title', tooltipText));
      });
    }
  });
};

export const FactionChain = new Page({
  name: 'Faction - Chain',
  description: 'Shows spies on the chain page',

  shouldRun: async function () {
    if (!Settings.getToggle(this.name) || !window.location.href.includes('factions.php?step=your'))
      return false;

    const el = await waitForElement(CHAIN_ITEM_SELECTOR, 15_000);

    return el !== null;
  },

  start: async function () {
    let updateChainMO: MutationObserver | null = null;

    xhook.after(async (request, _response) => {
      if (request.url.includes('warID=chain') === false) {
        return;
      }

      Logger.debug(`${this.name}: Found Chain War users request:`, request.url);

      const attacks = await waitForElement(ATTACK_LIST_SELECTOR, 15_000);

      if (!attacks) {
        Logger.error(`${this.name}: Could not find attacks list (element did not show up in time)`);
        return;
      }

      if (updateChainMO !== null) {
        updateChainMO.disconnect();
        updateChainMO = null;
      }

      await addStats();

      updateChainMO = new MutationObserver(async _mutations => {
        let redo = false;

        $(`${CHAIN_ITEM_SELECTOR} li`).each(function (_index: number, element: HTMLElement) {
          if (redo === true) {
            return;
          }

          if ($(element).find('.tsc-chain-spy').length === 0) {
            redo = true;
            addStats();
          }
        });
      });

      updateChainMO.observe(attacks, {
        childList: true,
        subtree: true,
      });
    });

    // The chain is already opened
    if (window.location.href.includes('war/chain')) {
      const attacks = await waitForElement(ATTACK_LIST_SELECTOR, 15_000);

      if (!attacks) {
        Logger.error(`${this.name}: Could not find attacks list (element did not show up in time)`);
        return;
      }

      await addStats();
    }
  },
});

// const chainBig = document.querySelector(CHAIN_ITEM_SELECTOR);
// if (!chainBig) {
//   Logger.error(`${this.name}: Could not find element`);
//   return;
// }
// const observer = new MutationObserver(async mutations => {
//   if (mutations.length === 0) return;
//   const newElement = document.querySelector(CHAIN_ITEM_SELECTOR);
//   if (!newElement?.classList.contains('act')) {
//     return;
//   }
//   Logger.debug(`${this.name}: Chain is active`);
//   if (updateChainMO !== null) {
//     updateChainMO.disconnect();
//     updateChainMO = null;
//   }
//   // RW: faction_wars.php?redirect=false&step=getwarusers&factionID=ID_HERE&userID=0&warID=rank&rfcv=somethingHere
//   // CH: faction_wars.php?redirect=false&step=getwarusers&factionID=0&userID=0&warID=chain&rfcv=somethingHere
//   const attacks = await waitForElement(ATTACK_LIST_SELECTOR, 15_000);
//   if (!attacks) {
//     Logger.debug(`${this.name}: Could not find attacks list (element did not show up in time)`);
//     return;
//   }
// const addAttacks = async (): Promise<void> => {
//   $(`${ATTACK_LIST_SELECTOR} li`).each(function (_index: number, element: HTMLElement) {
//     const users = $(element).find(NAME_SELECTOR);
//     for (let i = 0; i <= 1; i++) {
//       const u = users[i];
//       const id = $(u).find('a').attr('href');
//       if (!id) {
//         Logger.warn('Faction - Chain: Failed to find ID.');
//         return;
//       }
//       const userId = id.split('XID=')[1];
//       getTSCSpyOld(userId).then(spy => {
//         if ('error' in spy || spy.success !== true) {
//           Logger.warn(`Faction - Chain: Failed to find spy for ${userId}`, spy);
//           return;
//         }
//         const { spyText, tooltipText } = formatSpy(spy);
//         // I know this technically wastes a call, but it seems it only works like this
//         if ($(u).find('.tsc-chain-spy').length > 0) {
//           return;
//         }
//         $(u).append(
//           $('<div>').addClass('tsc-chain-spy').text(spyText).attr('title', tooltipText)
//         );
//       });
//     }
//   });
// };
// updateChainMO = new MutationObserver(async _mutations => {
//   let redo = false;
//   $(`${CHAIN_ITEM_SELECTOR} li`).each(function (_index: number, element: HTMLElement) {
//     if ($(element).find('.tsc-chain-spy').length === 0 && redo === false) {
//       redo = true;
//       addAttacks();
//     }
//   });
// });
// await addAttacks();
// updateChainMO.observe(attacks, {
//   childList: true,
//   subtree: true,
// });
// });
// observer.observe(chainBig, {
//   attributes: true,
//   attributeFilter: ['class'],
// });
