export interface IService {
	available: boolean;
	product_id: string;
	min_channel_size: number;
	max_channel_size: number;
	min_chan_expiry: number;
	max_chan_expiry: number;
	order_states: {
		CREATED: number;
		PAID: number;
		URI_SET: number;
		OPENED: number;
		GIVE_UP: number;
	};
}

export interface IGetInfoResponse {
	capacity: {
		local_balance: number;
		remote_balance: number;
	};
	services: IService[];
	node_info: {
		alias: string;
		active_channels_count: number;
		uris: string[];
		public_key: string;
	};
}

export interface IBuyChannelRequest {
	product_id: string;
	remote_balance: number;
	local_balance: number;
	channel_expiry: number;
}

export interface IBuyChannelResponse {
	order_id: string;
	ln_invoice: string;
	price: number;
	lnurl_channel: string;
}
