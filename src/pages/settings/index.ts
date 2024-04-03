import "./settings.css";
import Logger from "../../utils/logger.js";
import Page from "../page.js";
import Settings from "../../utils/local-storage.js";
import * as Features from "../index.js";
import { waitForElement } from "../../utils/dom.js";

export const SettingsPanel = new Page({
  name: "Settings Panel",
  description: "Adds a settings panel to the factions page.",

  shouldRun: async function () {
    return window.location.pathname === "/factions.php";
  },

  start: async function () {
    const element = await waitForElement(`#factions > ul`, 15_000);

    if (element === null) {
      Logger.warn(`${this.name}: Failed to find element to append to.`);
      return;
    }

    const relevantFeatures = Object.values(Features);

    Logger.debug(`Features:`, relevantFeatures);

    $(element).after(
      $("<details>")
        // .attr("open", "")
        .addClass("tsc-accordion")
        .append($("<summary>").text("TSC Settings"))
        .append(
          $("<p>")
            .css("margin-top", "5px")
            .text(
              "This is the settings panel for the Torn Spies Central script."
            ),
          $("<p>").text(
            "Here you can configure the settings to your liking. Please note that changes will be saved automatically."
          ),

          $("<br>"),

          // GLOBAL TOGGLE - BEGIN
          $("<div>")
            .addClass("tsc-setting-entry")
            .append(
              $("<input>")
                .attr("type", "checkbox")
                .attr("id", "enable")
                .prop("checked", Settings.getToggle("enable"))
                .on("change", function () {
                  Settings.setSetting("enable", $(this).prop("checked"));
                  Logger.debug(`Set enable to ${$(this).prop("checked")}`);
                })
            )
            .append($("<p>").text("Enable Script")),
          // GLOBAL TOGGLE - END

          $("<br>"),

          // API KEY INPUT - BEGIN
          $("<div>")
            .addClass("tsc-setting-entry")
            .append(
              $("<label>").attr("for", "api-key").text("API Key"),

              $("<input>")
                .attr("type", "text")
                .attr("id", "api-key")
                .attr("placeholder", "Paste your key here...")
                .addClass("tsc-key-input")
                .addClass("tsc-blur")
                .val(Settings.getSetting("api-key") || "")
                .on("change", function () {
                  const key = $(this).val();

                  if (typeof key !== "string") {
                    Logger.warn("API Key is not a string.");
                    return;
                  }

                  if (!/^[a-zA-Z0-9]{16}$/.test(key)) {
                    Logger.warn("API Key is not valid.");
                    $(this).css("outline", "1px solid red");
                    return;
                  }

                  $(this).css("outline", "none");

                  if (key === Settings.getSetting("api-key")) return;

                  Settings.setSetting("api-key", key);
                  Logger.debug(`Set api-key to ${key}`);
                })
            ),
          // API KEY INPUT - END

          $("<br>"),

          // FEATURE TOGGLES - BEGIN
          relevantFeatures.map((feature) =>
            $("<div>")
              .append(
                $("<div>")
                  .addClass("tsc-setting-entry")
                  .append(
                    $("<input>")
                      .attr("type", "checkbox")
                      .attr("id", feature.name)
                      .prop("checked", Settings.getToggle(feature.name))
                      .on("change", function () {
                        Settings.setSetting(
                          feature.name,
                          $(this).prop("checked")
                        );
                        Logger.debug(
                          `Set ${feature.name} to ${$(this).prop("checked")}`
                        );
                      })
                  )
                  .append($("<p>").text(feature.name))
              )
              .append($("<p>").text(feature.description))
          ),
          // FEATURE TOGGLES - END

          $("<br>"),
          $("<br>"),

          $("<p>")
            .text(
              "The following buttons need to be double clicked to prevent accidental clicks."
            )
            .css("margin-bottom", "10px"),

          $("<button>")
            .text("Clear cached spies")
            .addClass("tsc-button")
            .css("margin-right", "5px")
            .on("dblclick", async function () {
              const counter = Settings.spyClear();
              Logger.debug("Cleared all cached spies");

              const btn = $(this);

              btn
                .animate({ opacity: 0 }, "slow", function () {
                  btn.text(`Cleared ${counter} spies`);
                })
                .animate({ opacity: 1 }, "slow");

              setTimeout(function () {
                btn
                  .animate({ opacity: 0 }, "slow", function () {
                    btn.text("Clear cached spies");
                  })
                  .animate({ opacity: 1 }, "slow");
              }, 3000);
            }),

          $("<button>")
            .text("Clear all cache")
            .addClass("tsc-button")
            .on("dblclick", async function () {
              const counter = Settings.fullClear();
              Logger.debug("Cleared all cache");

              const btn = $(this);

              btn
                .animate({ opacity: 0 }, "slow", function () {
                  btn.text(`Cleared ${counter} items`);
                })
                .animate({ opacity: 1 }, "slow");

              setTimeout(function () {
                btn
                  .animate({ opacity: 0 }, "slow", function () {
                    btn.text("Clear all cache");
                  })
                  .animate({ opacity: 1 }, "slow");
              }, 3000);
            })
        )
    );
  },
});