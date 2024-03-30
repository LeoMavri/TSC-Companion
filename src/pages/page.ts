export default interface Page {
  name: string;
  description: string;
  enabled: boolean; // this will be fetched from local storage or something along those lines

  shouldRun(): Promise<boolean>;
  start(): Promise<void>;
}
