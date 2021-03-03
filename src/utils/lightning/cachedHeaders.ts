import { ENetworks as LndNetworks } from 'react-native-lightning/src/types';
import {
	DownloadBeginCallbackResult,
	DownloadProgressCallbackResult,
} from 'react-native-fs';
import RNFS from 'react-native-fs';
import { err, ok, Result } from '../result';

export const downloadNeutrinoCache = async (
	network: LndNetworks,
): Promise<Result<boolean>> => {
	const url = 'https://github.com/Jasonvdb/lnd-ios/releases/download/1/';
	const zipFile = `lnd-neutrino-${network}.zip`;
	const newFile = 'lnd-neutrino-cache.zip';
	const unzipTo = `${RNFS.DocumentDirectoryPath}/${newFile}`;
	const existingLndDir = `${RNFS.DocumentDirectoryPath}/lnd`;

	let progressPercent = 0;

	const begin = (res: DownloadBeginCallbackResult): void => {
		console.log(`START DOWNLOAD: ${res.statusCode}`);
	};

	const progress = (res: DownloadProgressCallbackResult): void => {
		const percentage = Math.floor((res.bytesWritten / res.contentLength) * 100);

		//No need to update after each byte
		if (percentage !== progressPercent) {
			console.log(`PROGRESS: ${percentage}`);
			progressPercent = percentage;
		}
	};

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

		await cleanupCache(unzipTo);

		if (res.statusCode === 200) {
			return ok(true);
		}

		return err(`Failed with code ${res.statusCode}`);
	} catch (e) {
		return err(e);
	}
};

const cleanupCache = async (filePath: string): Promise<Result<boolean>> => {
	try {
		await RNFS.unlink(filePath);
		return ok(true);
	} catch (e) {
		return err(e);
	}
};
