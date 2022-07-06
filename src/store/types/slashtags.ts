// TODO move this interface to the Slashtags SDK once its stable
export type BasicProfile = Partial<{
	id: string;
	name: string;
	about: string;
	image: string;
	[key: string]: string;
}>;

export interface ProfileStatus {
	seen: number;
}

export interface ISlashtags {
	visitedProfile: boolean;
	profiles: { [id: string]: ProfileStatus };
}
