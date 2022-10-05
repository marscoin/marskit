export interface IWidget {
	magiclink: boolean;
}

export interface IWidgets {
	widgets: { [url: string]: IWidget };
}
