import * as Feat from "./pages/index.js";

export const Constants = {
  Debug: true,

  Colours: {
    Info: "#05668D",
    Warn: "#EDDEA4",
    Error: "#ff0000",
    Debug: "#5C415D",
  },

  Features: Object.values(Feat).map((f) => new f()),
};
