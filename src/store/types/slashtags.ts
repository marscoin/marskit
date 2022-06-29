// TODO move this interface to the Slashtags SDK once its stable
export interface BasicProfile {
	id?: string;
	name?: string;
	about?: string;
}

export interface ISlashtags {
	visitedProfile: boolean;
}
