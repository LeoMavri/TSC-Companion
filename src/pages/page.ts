export type FeatureNames =
  | 'Settings Panel'
  | 'Profile Page'
  | 'Faction - Normal'
  | 'Faction - War'
  | 'Faction - Chain'
  | 'Faction - TT War'
  | 'Company Page'
  | 'Abroad Page'
  | 'Points Market';

type PageOptions = {
  name: FeatureNames;
  description: string;

  shouldRun: () => Promise<boolean>;
  start: () => Promise<void>;
};

export default class Page {
  readonly name: FeatureNames;
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
