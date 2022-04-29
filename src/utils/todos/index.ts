import { Alert } from 'react-native';
import { ITodo, TTodoType } from '../../store/types/todos';
import { getStore } from '../../store/helpers';
import { addTodo, removeTodo } from '../../store/actions/todos';

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
		title: 'Instant payments',
		description: 'Get on Lightning',
		id: 'lightning',
	},
	pin: {
		type: 'pin',
		title: 'Increase security',
		description: 'Set up a PIN',
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
	const backupStatus = !!getStore().backup.username;
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
	// Add backupSeedPhrase to-do if it hasn't been previously dismissed and isn't included in the todos array
	if (!seedPhraseDismissed.length && !seedPhraseTodo.length) {
		addTodo(todoPresets.backupSeedPhrase);
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
				navigation.navigate('Settings', { screen: 'Pin' });
				break;
			case 'lightning':
				navigation.navigate('LightningRoot');
				break;
			default:
				Alert.alert('TODO: ' + type);
				return;
		}
	} catch {}
};
