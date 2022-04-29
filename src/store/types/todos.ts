export type TTodoType =
	| 'activateBackup'
	| 'backupSeedPhrase'
	| 'boost'
	| 'pin'
	| 'lightning';

export interface ITodo {
	id: string;
	type: TTodoType;
	title: string;
	description: string;
}

export interface ITodos {
	todos: ITodo[];
	dismissedTodos: string[];
}
