import { TSdkState, TBasicProfile } from '@synonymdev/react-native-slashtags';

export interface ISlashtags {
	sdkState: TSdkState;
	profiles: { [name: string]: TBasicProfile };
	currentProfileName: string; //Current selected profile (default authentication)
}
