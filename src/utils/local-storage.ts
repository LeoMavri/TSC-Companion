// TODO: Type the "key" with only the known keys

class Settings {
  private storageKey: string;
  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  getToggle(key: string) {
    return this.getSetting(key) === "true";
  }

  getSetting(key: string) {
    return localStorage.getItem(`${this.storageKey}-${key}`);
  }

  setSetting(key: string, value: string) {
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
}

export default new Settings("kwack.mavri.tsc.rocks");
