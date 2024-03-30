import "./settings.css";
import { waitForElement } from "../../utils/dom.js";
import { Constants } from "../../constants.js";
import Logger from "../../utils/logger.js";
import Page from "../page.js";

export class SettingsPanel implements Page {
  public readonly name = "Settings Panel";
  public readonly description = "Adds a settings panel to the factions page.";
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

    const relevantFeatures = Constants.Features.filter(
      (f) => f.name !== "Settings Panel"
    ); // remove the settings panel lol

    Logger.debug(`Features:`, relevantFeatures);

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
          ),

          $("<br>"),

          relevantFeatures.map((feature) =>
            $("<p>")
              .text(feature.name)
              .append($("<p>").text(feature.description))
          )
          // todo: for loop through all of the settings and create a checkbox for each
        )
    );
  }
}
