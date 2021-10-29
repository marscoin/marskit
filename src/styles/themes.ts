import configureFonts, { IFont } from './fonts';
import colors, { IColors } from './colors';

export interface IDefaultColors extends IColors {
	accent: string;
	success: string;
	error: string;
	transparent: string;
}

export interface IThemeColors extends IDefaultColors {
	text: string;
	primary: string;
	background: string;
	surface: string;
	onBackground: string;
	onSurface: string;
	logText: string;
	refreshControl: string;
	tabBackground: string;
}

export interface ITheme {
	id: string;
	colors: IThemeColors;
	fonts: IFont;
}

interface IDefaultThemeValues {
	colors: IDefaultColors;
	fonts: IFont;
}

const defaultThemeValues: IDefaultThemeValues = {
	colors: {
		...colors,
		accent: '#0000007F',
		success: '#A2BC91',
		error: '#D87682',
		transparent: 'transparent',
	},
	fonts: configureFonts(),
};

const light: ITheme = {
	...defaultThemeValues,
	id: 'light',
	colors: {
		...defaultThemeValues.colors,
		text: '#121212',
		primary: '#121212',
		background: colors.white84,
		surface: '#E8E8E8',
		onBackground: '#121212',
		onSurface: '#D6D6D6',
		logText: '#121212',
		refreshControl: '#121212',
		tabBackground: '#f2f2f2',
	},
};

const dark: ITheme = {
	...defaultThemeValues,
	id: 'dark',
	colors: {
		...defaultThemeValues.colors,
		text: '#FFFFFF',
		primary: '#FFFFFF',
		background: colors.black,
		surface: '#333333',
		onBackground: '#FFFFFF',
		onSurface: colors.gray6,
		logText: '#16ff00',
		refreshControl: '#FFFFFF',
		tabBackground: '#1C1C1F',
	},
};

export default { light, dark };
