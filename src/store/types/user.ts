export interface IUser {
	loading: boolean;
	error: boolean;
	isHydrated: boolean;
	isOnline: boolean;
	[key: string]: any;
}
