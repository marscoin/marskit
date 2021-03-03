import { ENetworks as LndNetworks } from 'react-native-lightning/src/types';
import {
	DownloadBeginCallbackResult,
	DownloadProgressCallbackResult,
} from 'react-native-fs';
import RNFS from 'react-native-fs';
import { err, ok, Result } from '../result';

const begin = (res: DownloadBeginCallbackResult): void => {
	console.log(`START: ${res.statusCode}`);
};

const progress = (res: DownloadProgressCallbackResult): void => {
	const percentage = Math.floor((res.bytesWritten / res.contentLength) * 100);
	console.log(`PROGRESS: ${percentage}`);
};

export const downloadNeutrinoCache = async (
	network: LndNetworks,
): Promise<Result<boolean>> => {
	const url = 'https://github.com/Jasonvdb/lnd-ios/releases/download/1/';
	const zipFile = `lnd-neutrino-${network}.zip`;
	const newFile = `${new Date().getTime()}-${zipFile}`;
	const unzipTo = `${RNFS.DocumentDirectoryPath}/${newFile}`;
	const existingLndDir = `${RNFS.DocumentDirectoryPath}/lnd`;

	try {
		//If directory exists don't mess with it to be safe
		const exists = await RNFS.exists(existingLndDir);
		if (exists) {
			return ok(true);
		}

		const res = await RNFS.downloadFile({
			fromUrl: `${url}/${zipFile}`,
			toFile: `${unzipTo}`, // Local filesystem path to save the file to
			begin,
			progress,
		}).promise;

		alert('DONEZO ' + res.statusCode);

		if (res.statusCode === 200) {
			return ok(true);
		}

		return err(`Failed with code ${res.statusCode}`);
	} catch (e) {
		return err(e);
	}
};

const cleanupCaches = (filePath: string): Promise<void> => {
	return (
		RNFS.unlink(filePath)
			.then(() => {
				console.log('FILE DELETED');
			})
			// `unlink` will throw an error, if the item to unlink does not exist
			.catch((err) => {
				console.log(err.message);
			})
	);
};
