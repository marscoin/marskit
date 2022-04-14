import { IFees } from '../types/fees';

export const FeeText = {
	instant: {
		title: 'Instant',
		description: '2 - 10 secs',
	},
	fast: {
		title: 'Fast',
		description: '10 - 20 mins',
	},
	normal: {
		title: 'Normal',
		description: '20 - 60 mins',
	},
	slow: {
		title: 'Slow',
		description: '1 - 2 hours',
	},
	custom: {
		title: 'Custom',
		description: '',
	},
	none: {
		title: '',
		description: '',
	},
};

export const defaultFeesShape: IFees = {
	//On-chain fees in sats/vbyte
	onchain: {
		fast: 4, // 10-20 mins
		normal: 3, // 20-60 mins
		slow: 2, // 1-2 hrs
		minimum: 1,
		timestamp: Date.now(),
	},
};
