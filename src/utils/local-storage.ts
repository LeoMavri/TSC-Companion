// TODO: Type the "key" with only the known keys

import Logger from "./logger";

class Settings {
  private storageKey: string;
  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  getToggle(key: string): boolean {
    return this.getSetting(key) === "true";
  }

  getSetting(key: string): string | null {
    return localStorage.getItem(`${this.storageKey}-${key}`);
  }

  setSetting(key: string, value: string): void {
    localStorage.setItem(`${this.storageKey}-${key}`, value);
  }

  getJSON<T>(key: string): T | null {
    const value = this.getSetting(key);
    if (value === null) return null;
    return JSON.parse(value);
  }

  setJSON(key: string, value: any) {
    this.setSetting(key, JSON.stringify(value));
  }

  fullClear(): number {
    let counter = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.storageKey)) {
        localStorage.removeItem(key);
        Logger.debug(`Cleared ${key}`);
        ++counter;
      }
    }

    return counter;
  }

  spyClear(): number {
    let counter = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.storageKey}-spy`)) {
        localStorage.removeItem(key);
        Logger.debug(`Cleared ${key}`);
        ++counter;
      }
    }

    return counter;
  }
}

export default new Settings("kwack.mavri.tsc.rocks");
