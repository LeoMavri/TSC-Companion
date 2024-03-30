import Page from "../page";

export class ProfilePage implements Page {
  public readonly name = "Profile Page";
  public readonly description = "Shows a user's spy on their profile page";
  public enabled = true; // todo: fetch from ls

  public async shouldRun(): Promise<boolean> {
    return false;
  }

  public async start(): Promise<void> {
    console.log("Profile Page started");
  }
}
