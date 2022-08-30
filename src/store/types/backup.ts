export interface IBackup {
	//Backpack
	remoteBackupsEnabled: boolean;
	remoteLdkBackupSynced: boolean;
	remoteLdkBackupLastSync?: number;
	//TODO transactions, slashtags, metadata, etc.

	//iCloud
	iCloudBackupsEnabled: boolean;
	iCloudLdkBackupsSynced: boolean;
	iCloudLdkBackupLastSync?: number;
	//TODO transactions, slashtags, metadata, etc.

	//Google Drive
	gDriveBackupsEnabled: boolean;
	gDriveLdkBackupsSynced: boolean;
	gDriveLdkBackupLastSync?: number;
	//TODO transactions, slashtags, metadata, etc.
}
