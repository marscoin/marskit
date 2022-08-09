export interface IBackup {
	//Backpack
	remoteBackupsEnabled: boolean;
	remoteLdkBackupSynced: boolean;
	remoteLdkBackupLastSync?: Date;
	//TODO transactions, slashtags, metadata, etc.

	//iCloud
	iCloudBackupsEnabled: boolean;
	iCloudLdkBackupsSynced: boolean;
	iCloudLdkBackupLastSync?: Date;
	//TODO transactions, slashtags, metadata, etc.

	//Google Drive
	gDriveBackupsEnabled: boolean;
	gDriveLdkBackupsSynced: boolean;
	gDriveLdkBackupLastSync?: Date;
	//TODO transactions, slashtags, metadata, etc.
}
