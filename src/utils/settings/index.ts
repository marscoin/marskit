import { resetKeychainValue, setKeychainValue } from '../helpers';
import { updateSettings } from '../../store/actions/settings';
import { getStore } from '../../store/helpers';

/**
 * @async
 * Wipes pin data from device memory.
 */
export const removePin = async (): Promise<void> => {
	await Promise.all([
		updateSettings({ pin: false }),
		setKeychainValue({ key: 'pinAttemptsRemaining', value: '5' }),
		resetKeychainValue({ key: 'pin' }),
	]);
};

/**
 * Toggles biometric authentication.
 * @param {boolean} [biometrics]
 */
export const toggleBiometrics = (
	biometrics: boolean | undefined = undefined,
): void => {
	try {
		const currentBiometrics = getStore().settings.biometrics;
		if (biometrics === undefined) {
			updateSettings({
				biometrics: !currentBiometrics,
			});
			return;
		}
		if (biometrics !== currentBiometrics) {
			updateSettings({
				biometrics: !getStore().settings.biometrics,
			});
		}
	} catch {}
};
