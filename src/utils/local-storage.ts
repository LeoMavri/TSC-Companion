// TODO: Add types to local storage stuff
// type KnownLS = "tsc-key" | "ts-key" | "yata-key" | `spy-${number}`;

class Settings {
  private storageKey: string;
  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  get(key: string): string | null {
    return localStorage.getItem(`${this.storageKey}-${key}`);
  }

  set(key: string, value: string): void {
    localStorage.setItem(`${this.storageKey}-${key}`, value);
  }

  getToggle(key: string): boolean {
    return this.get(key) === 'true';
  }

  getJSON<T>(key: string): T | null {
    const value = this.get(key);
    if (value === null) return null;
    return JSON.parse(value);
  }

  setJSON(key: string, value: any): void {
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
