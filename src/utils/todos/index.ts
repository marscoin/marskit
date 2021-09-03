import { ITodo, TTodoType } from '../../store/types/todos';
import { getStore } from '../../store/helpers';
import { addTodo, removeTodo } from '../../store/actions/todos';

type TTodoPresets = { [key in TTodoType]: ITodo };
export const todoPresets: TTodoPresets = {
	activateBackup: {
		type: 'activateBackup',
		title: 'Secure your wallet',
		description: 'Activate online backups.',
		id: 'activateBackup',
	},
	backupSeedPhrase: {
		type: 'backupSeedPhrase',
		title: 'Seed phrase backup',
		description: 'Write down seed phrase.',
		id: 'backupSeedPhrase',
	},
	boost: {
		type: 'boost',
		title: 'Boost Transaction',
		description: 'Increase transaction confirmation time.',
		id: 'boost',
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
	// Add backupTodo if status is false and is not included in the todos array.
	if (!backupStatus && !backupTodo?.length) {
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
				navigation.navigate('BackupSettings');
				break;
			default:
				return;
		}
	} catch {}
};
