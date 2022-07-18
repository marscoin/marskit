// TODO move this interface to the Slashtags SDK once its stable
export type BasicProfile = Partial<{
	id: string;
	name: string;
	bio: string;
	image: string;
	links: Array<Link>;
}>;

export interface Link {
	title: string;
	url: string;
}

export interface ProfileStatus {
	version: number;
}

export interface ISlashtags {
	onboardedProfile: boolean;
	visitedContacts: boolean;
	profiles: { [id: string]: ProfileStatus };
}
