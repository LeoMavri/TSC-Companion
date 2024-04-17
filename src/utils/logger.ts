import { Constants } from "../constants.js";
import Settings from "./local-storage.js";

export default class Logger {
  public static info(message: string, ...obj: any): void {
    console.info(
      `%c[TSC Companion] ${message}`,
      `color: ${Constants.Colours.Info}`,
      ...obj
    );
  }

  public static warn(message: string, ...obj: any): void {
    console.log(
      `%c[TSC Companion] ${message}`,
      `color: ${Constants.Colours.Warn}`,
      ...obj
    );
  }

  public static error(message: string, ...obj: any): void {
    console.error(
      `%c[TSC Companion] ${message}`,
      `color: ${Constants.Colours.Error}`,
      ...obj
    );
  }

  public static debug(message: string, ...obj: any): void {
    if (!Settings.getToggle("debug-logs")) return;

    console.log(
      `%c[TSC Companion] ${message}`,
      `color: ${Constants.Colours.Debug}`,
      ...obj
    );
  }
}
