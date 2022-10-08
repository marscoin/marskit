// TODO(slashtags): move somewhere else? slashtags-feeds?
export interface SlashFeedJSON {
	name: string;
	type: string;
	icons: {
		[size: string]: string;
	};
	fields: Array<{
		name: string;
		main: string;
		files: Array<{ [key: string]: string }>;
		[key: string]: any;
	}>;
	[key: string]: any;
}

export interface IWidget {
	feed: {
		config: {
			name: string;
			icon: string;
			type: string;
		};
		selectedField: string;
	};
	magiclink: boolean;
}

export interface IWidgets {
	widgets: { [url: string]: IWidget };
}
