import configureFonts from "./fonts";
import colors from "./colors";

const defaultThemeValues = {
	colors: {
		...colors,
		accent: "#0000007F",
		success: "#A2BC91",
		error: "#D87682",
		transparent: "transparent"
	},
	fonts: configureFonts(),
};

export const light = {
	...defaultThemeValues,
	id: "light",
	colors: {
		...defaultThemeValues.colors,
		text: "#121212",
		primary: "#121212",
		background: "#FFFFFF",
		surface: "#FFFFFF",
		onBackground: "#121212",
		onSurface: "#121212",
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
