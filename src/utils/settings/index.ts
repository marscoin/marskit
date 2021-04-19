import { resetKeychainValue, setKeychainValue } from '../helpers';
import { updateSettings } from '../../store/actions/settings';

export const removePin = async (): Promise<void> => {
	await Promise.all([
		updateSettings({ pin: false }),
		setKeychainValue({ key: 'pinAttemptsRemaining', value: '5' }),
		resetKeychainValue({ key: 'pin' }),
	]);
};
