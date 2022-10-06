// TODO(slashtags): move somewhere else? slashtags-feeds?
export interface SlashFeedJSON {
	name: string;
	image: string;
	feed_type: string;
	[key: string]: any;
}

export interface IWidget {
	feed: {
		selectedField: string;
	};
	magiclink: boolean;
}

export interface IWidgets {
	widgets: { [url: string]: IWidget };
}
