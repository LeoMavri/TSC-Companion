import { Constants } from "../constants.js";
import Settings from "./local-storage.js";

const pdaKey = "###PDA-APIKEY###";
const isPda = pdaKey.includes("PDA-APIKEY") === false;

// biome-ignore lint/complexity/noStaticOnlyClass: cba to refactor this
export default class Logger {
	// biome-ignore lint/suspicious/noExplicitAny: it's any
	public static info(message: string, ...obj: any): void {
		let colorFirst = "%c";
		let colorEnd = `color: ${Constants.Colours.Info}`;

		if (isPda) {
			obj = obj.map((o: any) => JSON.stringify(o));
			colorFirst = "";
			colorEnd = "";
		}

		console.info(`${colorFirst}[TSC Companion] ${message}`, colorEnd, ...obj);
	}

	// biome-ignore lint/suspicious/noExplicitAny: it's any
	public static warn(message: string, ...obj: any): void {
		let colorFirst = "%c";
		let colorEnd = `color: ${Constants.Colours.Warn}`;

		if (isPda) {
			obj = obj.map((o: any) => JSON.stringify(o));
			colorFirst = "";
			colorEnd = "";
		}

		console.log(`${colorFirst}[TSC Companion] ${message}`, colorEnd, ...obj);
	}

	// biome-ignore lint/suspicious/noExplicitAny: it's any
	public static error(message: string, ...obj: any): void {
		let colorFirst = "%c";
		let colorEnd = `color: ${Constants.Colours.Error}`;

		if (isPda) {
			obj = obj.map((o: any) => JSON.stringify(o));
			colorFirst = "";
			colorEnd = "";
		}
		console.error(`${colorFirst}[TSC Companion] ${message}`, colorEnd, ...obj);
	}

	// biome-ignore lint/suspicious/noExplicitAny: it's any
	public static debug(message: string, ...obj: any): void {
		if (!Settings.getToggle("debug-logs")) return;

		let colorFirst = "%c";
		let colorEnd = `color: ${Constants.Colours.Debug}`;

		if (isPda) {
			obj = obj.map((o: any) => JSON.stringify(o));
			colorFirst = "";
			colorEnd = "";
		}

		console.log(`${colorFirst}[TSC Companion] ${message}`, colorEnd, ...obj);
	}
}
