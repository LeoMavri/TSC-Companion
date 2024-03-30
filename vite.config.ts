import { defineConfig } from "vite";
import monkey, { cdn } from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "TSC - Companion NEXT",
        description: "A very early version of the new TSC Companion script",
        author: "mavri [2402357]",
        copyright: "2024, diicot.cc",
        version: "NEXT-1",
        icon: "https://i.imgur.com/8eydsOA.png",
        namespace: "TSC",
        match: [
          "https://www.torn.com/profiles.php?*", // User Profile
          "https://www.torn.com/factions.php?step=your*", // Our Faction profile
        ],
        "run-at": "document-end",
      },
    }),
  ],
});
