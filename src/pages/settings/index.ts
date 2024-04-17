import "./settings.css";

import Logger from "../../utils/logger.js";
import Page from "../page.js";
import Settings from "../../utils/local-storage.js";
import * as Features from "../index.js";
import { waitForElement } from "../../utils/dom.js";
import { getLocalUserData } from "../../utils/api.js";

/**
 * TODO: Look into making an object that contains each setting and just iterate over that.
 * TODO: Move this to your own profile page (I'll have to check the sidebar)
 */

const FACTION_TAB_SELECTOR = "#factions > ul";

export const SettingsPanel = new Page({
  name: "Settings Panel",
  description: "Adds a settings panel to your own faction page.",

  shouldRun: async function () {
    return window.location.href.includes("factions.php?step=your");
  },

  start: async function () {
    const element = await waitForElement(FACTION_TAB_SELECTOR, 15_000);

    if (element === null) {
      Logger.warn(`${this.name}: Failed to find element to append to.`);
      return;
    }

    if (element.nextElementSibling?.classList.contains("tsc-accordion")) {
      Logger.warn(`${this.name}: Element already exists`);
      return;
    }
    const userData = await getLocalUserData();

    const headerHtml =
      "error" in userData
        ? $("<div>").text("Welcome!")
        : $("<div>").html(
            `Hey, ${$("<div>")
              .addClass("tsc-header-username")
              .text(userData.name)
              .prop("outerHTML")}!`
          );

    $(element).after(
      $("<details>")
        // .attr("open", "")
        .addClass("tsc-accordion")
        .append($("<summary>").text("TSC Settings"))
        .append(
          $("<div>").addClass("tsc-header").append(headerHtml),

          $("<p>")
            .css("margin-top", "5px")
            .text(
              "This is the settings panel for the Torn Spies Central script."
            ),
          $("<p>").text(
            "Here you can configure the settings to your liking. Please note that changes will be saved automatically."
          ),

          $("<p>")
            .css("margin-top", "5px")
            .text(
              "Note: Currently, the script works best with honor bars turned off. If you have them on, all spies (except on the profile page) will be unreadable. You can manage this in Settings -> General Settings -> Honor Names -> Off"
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
                  Settings.set("enable", $(this).prop("checked"));
                })
            )
            .append($("<p>").text("Enable Script")),
          // GLOBAL TOGGLE - END

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
                .val(Settings.get("api-key") || "")
                .on("change", function () {
                  const key = $(this).val();

                  if (typeof key !== "string") {
                    return;
                  }

                  if (!/^[a-zA-Z0-9]{16}$/.test(key)) {
                    $(this).css("outline", "1px solid red");
                    return;
                  }

                  $(this).css("outline", "none");

                  if (key === Settings.get("api-key")) return;

                  Settings.set("api-key", key);
                })
            ),
          // API KEY INPUT - END

          $("<br>"),

          $("<p>").text("Feature toggles:"),

          // FEATURE TOGGLES - BEGIN
          Object.values(Features).map((feature) =>
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
                        Settings.set(feature.name, $(this).prop("checked"));
                      })
                  )
                  .append($("<p>").text(feature.name))
              )
              .append($("<p>").text(feature.description))
          ),
          // FEATURE TOGGLES - END

          $("<br>"),

          $("<p>")
            .text(
              "The following buttons require a confirmation before anything is deleted."
            )
            .css("margin-bottom", "10px"),

          $("<button>")
            .text("Clear cached spies")
            .addClass("tsc-button")
            .css("margin-right", "10px")
            .on("click", async function () {
              const check = confirm(
                "Are you sure you want to clear cached spies?"
              );

              if (!check) return;

              const counter = Settings.spyClear();
              Logger.debug(`Cleared ${counter} spies from cache.`);

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
            .on("click", async function () {
              const check = confirm(
                "Are you sure you want to clear all cache?"
              );

              if (!check) return;

              const counter = Settings.fullClear();
              Logger.debug(`Cleared ${counter} items in cache.`);

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
            }),

          $("<br>"),
          $("<br>"),

          // DEBUG TOGGLES - BEGIN

          $("<p>").text("Debug settings:"),

          $("<div>")
            .addClass("tsc-setting-entry")
            .append(
              $("<input>")
                .attr("type", "checkbox")
                .attr("id", "debug-logs")
                .prop("checked", Settings.getToggle("debug-logs"))
                .on("change", function () {
                  Settings.set("debug-logs", $(this).prop("checked"));
                })
            )
            .append($("<p>").text("Extra debug logs"))

          // DEBUG TOGGLES - END
        )
    );
  },
});
