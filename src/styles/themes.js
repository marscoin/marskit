import configureFonts from "./fonts";

const defaultThemeValues = {
	colors: {
		accent: "#0000007F",
		success: "#A2BC91",
		error: "#D87682",
	},
	fonts: configureFonts(),
};

export const light = {
	...defaultThemeValues,
	id: "light",
	colors: {
		...defaultThemeValues.colors,
		text: "#000000",
		primary: "#000000",
		background: "#FFFFFF",
		surface: "#FFFFFF",
		onBackground: "#000000",
		onSurface: "#000000",
	}
};

export const dark = {
	...defaultThemeValues,
	id: "dark",
	colors: {
		...defaultThemeValues.colors,
		text: "#FFFFFF",
		primary: "#FFFFFF",
		background: "#121212",
		surface: "#121212",
		onBackground: "#FFFFFF",
		onSurface: "#FFFFFF",
	},
};
