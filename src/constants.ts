export const Constants = {
	Colours: {
		Info: "#05668D",
		Warn: "#EDDEA4",
		Error: "#ff0000",
		Debug: "#5C415D",
	},
	// TODO: Move the caching to the settings page
	Cache: {
		TSC: 12 * 60 * 60 * 1000, // 12 hours
		YATA: 7 * 24 * 60 * 60 * 1000, // 7 days
		TornStats: 7 * 24 * 60 * 60 * 1000, // 7 days
	},

	// TODO: use these
	API: {
		BaseUrl: "https://tsc.diicot.cc",
		Auth: "10000000-6000-0000-0009-000000000001",
	},
};
