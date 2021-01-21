import { Platform } from 'react-native';

export interface IFont {
	regular: {
		fontFamily: string;
		fontWeight: string;
	};
	medium: {
		fontFamily: string;
		fontWeight: string;
	};
	light: {
		fontFamily: string;
		fontWeight: string;
	};
	thin: {
		fontFamily: string;
		fontWeight: string;
	};
}

interface IFontConfig {
	web: IFont;
	ios: IFont;
	default: IFont;
}

const fontConfig: IFontConfig = {
	web: {
		regular: {
			fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
			fontWeight: '400',
		},
		medium: {
			fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
			fontWeight: '500',
		},
		light: {
			fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
			fontWeight: '300',
		},
		thin: {
			fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
			fontWeight: '100',
		},
	},
	ios: {
		regular: {
			fontFamily: 'System',
			fontWeight: '400',
		},
		medium: {
			fontFamily: 'System',
			fontWeight: '500',
		},
		light: {
			fontFamily: 'System',
			fontWeight: '300',
		},
		thin: {
			fontFamily: 'System',
			fontWeight: '100',
		},
	},
	default: {
		regular: {
			fontFamily: 'sans-serif',
			fontWeight: 'normal',
		},
		medium: {
			fontFamily: 'sans-serif-medium',
			fontWeight: 'normal',
		},
		light: {
			fontFamily: 'sans-serif-light',
			fontWeight: 'normal',
		},
		thin: {
			fontFamily: 'sans-serif-thin',
			fontWeight: 'normal',
		},
	},
};

const configureFonts = (config = {}): IFont =>
	Platform.select({ ...fontConfig, ...config });
export default configureFonts;
