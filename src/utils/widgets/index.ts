import b4a from 'b4a';

export enum SUPPORTED_FEED_TYPES {
	PRICE_FEED = 'exchange.price_history',
}

/**
 * Decode field value according to the feed type, and field name.
 * For unknown types or fields, it will decode using utf-8
 * and limit to 35 character (feel free to change or remove that limit in the future)
 */
export const decodeWidgetFieldValue = (type: string, buf: Uint8Array): any => {
	switch (type) {
		case SUPPORTED_FEED_TYPES.PRICE_FEED:
			const value = buf && b4a.toString(buf);
			return JSON.parse(value);

		default:
			return buf && b4a.toString(buf).slice(0, 35);
	}
};
