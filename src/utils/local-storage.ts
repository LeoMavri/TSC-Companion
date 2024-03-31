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
}

export default new Settings("kwack.mavri.tsc.rocks");
