export type TTodoType = 'activateBackup' | 'backupSeedPhrase' | 'boost';

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
