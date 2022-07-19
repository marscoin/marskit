// TODO move this interface to the Slashtags SDK once its stable
export type BasicProfile = Partial<{
	name: string;
	bio: string;
	image: string;
	links: Array<Link>;
}>;

export type SlashPayConfig = Partial<{
	p2wpkh: string;
}>;

export interface Link {
	title: string;
	url: string;
}

export interface ISlashtags {
	onboardingProfileStep:
		| 'Intro'
		| 'InitialEdit'
		| 'PaymentsFromContacts'
		| 'OfflinePayments'
		| 'Done';
}
