import type { FeatureNames } from '../pages/page.js';

type Toggles = 'enabled' | 'debug-logs' | FeatureNames;

type JSON = `spy-${string}` | 'user-data';

type KnownLS = 'tsc-key' | 'torn-stats-key' | 'yata-key' | JSON | Toggles;

class Settings {
  private storageKey: string;
  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  get(key: KnownLS): string | null {
    return localStorage.getItem(`${this.storageKey}-${key}`);
  }

  set(key: KnownLS, value: string): void {
    localStorage.setItem(`${this.storageKey}-${key}`, value);
  }

  getToggle(key: Toggles): boolean {
    return this.get(key) === 'true';
  }

  getJSON<T>(key: JSON): T | null {
    const value = this.get(key);
    if (value === null) return null;
    return JSON.parse(value);
  }

  setJSON(key: JSON, value: any): void {
    this.set(key, JSON.stringify(value));
  }

  fullClear(): number {
    let counter = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.storageKey)) {
        localStorage.removeItem(key);
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
        ++counter;
      }
    }

    return counter;
  }
}

export default new Settings('kwack.mavri.tsc.rocks');
