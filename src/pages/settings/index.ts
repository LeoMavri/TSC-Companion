import "./settings.css";
import { waitForElement } from "../../utils/dom.js";
import Logger from "../../utils/logger.js";
import Page from "../page.js";

export class SettingsPanel implements Page {
  public name = "Settings Panel";
  public description = "Adds a settings panel to the factions page.";
  public enabled = true; // can't be disabled lol

  public async shouldRun(): Promise<boolean> {
    return window.location.pathname === "/factions.php";
  }

  public async start(): Promise<void> {
    const element = await waitForElement(`#factions > ul`);

    if (element === null) {
      Logger.warn(`${this.name}: Failed to find element to append to.`);
      return;
    }

    $(element).after(
      $("<details>")
        .addClass("tsc-accordion")
        .append($("<summary>").text("TSC Settings"))
        .append(
          $("<p>").text(
            "This is the settings panel for the Torn Spies Central script."
          ),
          $("<p>").text(
            "Here you can configure the settings to your liking. Please note that changes will be saved automatically."
          )
          // todo: for loop through all of the settings and create a checkbox for each
        )
    );
  }
}
