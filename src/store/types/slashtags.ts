export type BasicProfile = Partial<{
	name: string;
	url: string;
	image: string;
	type: string;
	// TODO update Basic profile interface
}>;

export interface ISlashtagProfile {
	basicProfile: BasicProfile;
	slashtag?: string;
}

export interface ISlashtags {
	profiles: { [name: string]: ISlashtagProfile };
	currentProfileName: string; //Current selected profile (default authentication)
}
