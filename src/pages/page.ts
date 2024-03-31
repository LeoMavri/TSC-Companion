type PageOptions = {
  name: string;
  description: string;

  shouldRun: () => Promise<boolean>;
  start: () => Promise<void>;
};

export default class Page {
  readonly name: string;
  readonly description: string;
  shouldRun: () => Promise<boolean>;
  start: () => Promise<void>;

  constructor({ name, description, shouldRun, start }: PageOptions) {
    this.name = name;
    this.description = description;
    this.shouldRun = shouldRun;
    this.start = start;
  }
}
