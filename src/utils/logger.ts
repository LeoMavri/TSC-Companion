import Settings from './local-storage.js';
import { Constants } from '../constants.js';

const pdaKey = '###PDA-APIKEY###';
const isPda = pdaKey.includes('PDA-APIKEY') === false;

export default class Logger {
  public static info(message: string, ...obj: any): void {
    let colorFirst = '%c';
    let colorEnd = `color: ${Constants.Colours.Info}`;

    if (isPda) {
      obj = obj.map((o: any) => JSON.stringify(o));
      colorFirst = '';
      colorEnd = '';
    }

    console.info(`${colorFirst}[TSC Companion] ${message}`, colorEnd, ...obj);
  }

  public static warn(message: string, ...obj: any): void {
    let colorFirst = '%c';
    let colorEnd = `color: ${Constants.Colours.Warn}`;

    if (isPda) {
      obj = obj.map((o: any) => JSON.stringify(o));
      colorFirst = '';
      colorEnd = '';
    }

    console.log(`${colorFirst}[TSC Companion] ${message}`, colorEnd, ...obj);
  }

  public static error(message: string, ...obj: any): void {
    let colorFirst = '%c';
    let colorEnd = `color: ${Constants.Colours.Error}`;

    if (isPda) {
      obj = obj.map((o: any) => JSON.stringify(o));
      colorFirst = '';
      colorEnd = '';
    }
    console.error(`${colorFirst}[TSC Companion] ${message}`, colorEnd, ...obj);
  }

  public static debug(message: string, ...obj: any): void {
    if (!Settings.getToggle('debug-logs')) return;

    let colorFirst = '%c';
    let colorEnd = `color: ${Constants.Colours.Debug}`;

    if (isPda) {
      obj = obj.map((o: any) => JSON.stringify(o));
      colorFirst = '';
      colorEnd = '';
    }

    console.log(`${colorFirst}[TSC Companion] ${message}`, colorEnd, ...obj);
  }
}
