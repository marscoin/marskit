import { Alert } from 'react-native';
import { ITodo, TTodoType } from '../../store/types/todos';
import { getStore } from '../../store/helpers';
import { addTodo, removeTodo } from '../../store/actions/todos';
import { toggleView } from '../../store/actions/user';

type TTodoPresets = { [key in TTodoType]: ITodo };
export const todoPresets: TTodoPresets = {
	activateBackup: {
		type: 'activateBackup',
		title: 'Secure your wallet',
		description: 'Activate online backups',
		id: 'activateBackup',
	},
	backupSeedPhrase: {
		type: 'backupSeedPhrase',
		title: 'Backup',
		description: 'Store seed phrase',
		id: 'backupSeedPhrase',
	},
	boost: {
		type: 'boost',
		title: 'Boost Transaction',
		description: 'Increase transaction confirmation time',
		id: 'boost',
	},
	lightning: {
		type: 'lightning',
		title: 'Pay instantly',
		description: 'Get on Lightning',
		id: 'lightning',
	},
	pin: {
		type: 'pin',
		title: 'Better security',
		description: 'Set up a PIN code',
		id: 'pin',
	},
};

export const setupTodos = (): void => {
	const todos = getStore().todos.todos ?? [];
	const dismissedTodos = getStore().todos.dismissedTodos ?? [];

	/*
	 * Check for backup status.
	 */
	const backupTodo = todos.filter((todo) => todo.type === 'activateBackup');
	const backupStatus = getStore().backup.remoteBackupsEnabled;
	const activateBackupIsDismissed = 'activateBackup' in dismissedTodos;
	// Add backupTodo if status is false and is not included in the todos array.
	if (!backupStatus && !backupTodo?.length && activateBackupIsDismissed) {
		addTodo(todoPresets.activateBackup);
	}
	// Remove backupTodo if status is true and hasn't been removed from the todos array.
	if (backupStatus && backupTodo.length) {
		removeTodo(backupTodo[0].id);
	}

	/*
	 * Check for seed phrase backup.
	 */
	const seedPhraseDismissed = dismissedTodos.filter(
		(todo) => todo === 'backupSeedPhrase',
	);
	const seedPhraseTodo = todos.filter(
		(todo) => todo.type === 'backupSeedPhrase',
	);
	const backupSeedPhraseStatus = !!getStore().user.backupVerified;
	// Add backupSeedPhrase to-do if it hasn't been previously dismissed and isn't included in the todos array
	// and backup has not been verified
	if (
		!backupSeedPhraseStatus &&
		!seedPhraseDismissed.length &&
		!seedPhraseTodo.length
	) {
		addTodo(todoPresets.backupSeedPhrase);
	}
	if (backupSeedPhraseStatus && seedPhraseTodo.length) {
		removeTodo(seedPhraseTodo[0].id);
	}

	/*
	 * Check for lightning.
	 */
	const lightning = todos.some((todo) => todo.type === 'lightning');
	const lightningIsDismissed = 'lightning' in dismissedTodos;
	// Add lightning if status is false and is not included in the todos array.
	if (!lightning && !lightningIsDismissed) {
		addTodo(todoPresets.lightning);
	}
	// Remove lightning if status is true and hasn't been removed from the todos array.
	// if (lightning.length) {
	// 	removeTodo(lightning[0].id);
	// }

	/*
	 * Check for PIN.
	 */
	const pin = todos.some((todo) => todo.type === 'pin');
	const pinIsDismissed = 'pin' in dismissedTodos;
	// Add pin if status is false and is not included in the todos array.
	if (!pin && !pinIsDismissed) {
		addTodo(todoPresets.pin);
	}
	// Remove pin if status is true and hasn't been removed from the todos array.
	// if (pin.length) {
	// 	removeTodo(pin[0].id);
	// }
};

export const handleOnPress = ({
	navigation,
	type,
}: {
	navigation;
	type: TTodoType;
}): void => {
	try {
		switch (type) {
			case 'activateBackup':
				navigation.navigate('Settings', { screen: 'BackupSettings' });
				break;
			case 'pin':
				// navigation.navigate('Settings', { screen: 'Pin' });
				toggleView({
					view: 'PINPrompt',
					data: { isOpen: true },
				});
				break;
			case 'lightning':
				navigation.navigate('LightningRoot');
				break;
			case 'backupSeedPhrase':
				toggleView({
					view: 'backupPrompt',
					data: { isOpen: true },
				});
				break;
			default:
				Alert.alert('TODO: ' + type);
				return;
		}
	} catch {}
};
