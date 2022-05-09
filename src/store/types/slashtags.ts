import { TSdkState, TBasicProfile } from '@synonymdev/react-native-slashtags';

export interface ISlashtagProfile {
	basicProfile: TBasicProfile;
	slashtag?: string;
}

export interface ISlashtags {
	apiReady: boolean;
	sdkState: TSdkState;
	profiles: { [name: string]: ISlashtagProfile };
	currentProfileName: string; //Current selected profile (default authentication)
}
