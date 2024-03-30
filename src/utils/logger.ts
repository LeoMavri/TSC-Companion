import { CONSTANTS } from "../constants";

export default class Logger {
  public static info(message: string, ...obj: any): void {
    console.info(
      `%c[TSC Companion] ${message}`,
      `color: ${CONSTANTS.COLOURS.INFO}`,
      ...obj
    );
  }

  public static warn(message: string, ...obj: any): void {
    console.log(
      `%c[TSC Companion] ${message}`,
      `color: ${CONSTANTS.COLOURS.WARN}`,
      ...obj
    );
  }

  public static error(message: string, ...obj: any): void {
    console.error(
      `%c[TSC Companion] ${message}`,
      `color: ${CONSTANTS.COLOURS.ERROR}`,
      ...obj
    );
  }

  public static debug(message: string, ...obj: any): void {
    if (!CONSTANTS.DEBUG) return;

    console.log(
      `%c[TSC Companion] ${message}`,
      `color: ${CONSTANTS.COLOURS.DEBUG}`,
      ...obj
    );
  }
}
