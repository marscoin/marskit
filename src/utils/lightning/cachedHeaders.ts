import { ENetworks as LndNetworks } from '@synonymdev/react-native-lightning';
import { DownloadProgressCallbackResult } from 'react-native-fs';
import RNFS from 'react-native-fs';
import { unzip, subscribe } from 'react-native-zip-archive';
import { err, ok, Result } from '../result';
import { updateCachedNeutrinoDownloadState } from '../../store/actions/lightning';
import { getStore } from '../../store/helpers';

export const downloadNeutrinoCache = async (
	network: LndNetworks,
): Promise<Result<boolean>> => {
	const url = 'https://github.com/Jasonvdb/lnd-ios/releases/download/1/';
	const zipFile = `lnd-neutrino-${network}.zip`;
	const newFile = 'lnd-neutrino-cache.zip';
	const saveZipTo = `${RNFS.DocumentDirectoryPath}/${newFile}`;
	const unzipTo = RNFS.DocumentDirectoryPath;
	const existingLndDir = `${RNFS.DocumentDirectoryPath}/lnd`;

	const currentTask = getStore().lightning.cachedNeutrinoDBDownloadState.task;
	if (currentTask === 'downloading' || currentTask === 'unzipping') {
		return ok(true);
	}

	let progressPercent = 0;

	const begin = (): void => {
		updateCachedNeutrinoDownloadState({
			task: 'downloading',
			downloadProgress: 0,
		});
	};

	const progress = (res: DownloadProgressCallbackResult): void => {
		const percentage = Math.floor((res.bytesWritten / res.contentLength) * 100);

		//No need to update after each byte
		if (percentage !== progressPercent) {
			updateCachedNeutrinoDownloadState({
				task: 'downloading',
				downloadProgress: percentage,
			});

			progressPercent = percentage;
		}
	};

	try {
		//If directory exists don't mess with it to be safe
		const exists = await RNFS.exists(existingLndDir);
		if (exists) {
			await updateCachedNeutrinoDownloadState({ task: 'complete' });
			return ok(true);
		}

		const res = await RNFS.downloadFile({
			fromUrl: `${url}/${zipFile}`,
			toFile: `${saveZipTo}`, // Local filesystem path to save the file to
			begin,
			progress,
		}).promise;

		if (res.statusCode !== 200) {
			await updateCachedNeutrinoDownloadState({ task: 'failed' });
			return err(`Failed with code ${res.statusCode}`);
		}

		//Sanity check to confirm LND dir wasn't created while download happened
		const existsCheck = await RNFS.exists(existingLndDir);
		if (existsCheck) {
			await cleanupCache(saveZipTo);
			await updateCachedNeutrinoDownloadState({ task: 'complete' });
			return ok(true);
		}

		//Unzip
		await updateCachedNeutrinoDownloadState({ task: 'unzipping' });
		const unzipRes = await unzipCache(saveZipTo, unzipTo, (unzipProgress) =>
			updateCachedNeutrinoDownloadState({ unzipProgress }),
		);

		if (unzipRes.isErr()) {
			await updateCachedNeutrinoDownloadState({ task: 'failed' });

			return err(unzipRes.error);
		}

		await cleanupCache(saveZipTo);

		await updateCachedNeutrinoDownloadState({ task: 'complete' });

		return ok(true);
	} catch (e) {
		await updateCachedNeutrinoDownloadState({ task: 'failed' });

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

const unzipCache = async (
	sourcePath: string,
	targetPath: string,
	onProgress: (number) => void,
): Promise<Result<string>> => {
	const zipProgress = subscribe(({ progress }) => {
		onProgress(Math.floor(progress * 100));
	});

	try {
		const path = await unzip(sourcePath, targetPath);
		zipProgress.remove();

		return ok(path);
	} catch (e) {
		zipProgress.remove();
		return err(e);
	}
};
