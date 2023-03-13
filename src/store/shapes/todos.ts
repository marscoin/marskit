import { ITodo, TTodoType } from '../types/todos';

const imageSafe = require('../../assets/illustrations/safe.png');
const imageLightning = require('../../assets/illustrations/lightning.png');
const imageTransfer = require('../../assets/illustrations/transfer.png');
const imageShield = require('../../assets/illustrations/shield.png');
const imageCrown = require('../../assets/illustrations/crown-no-margins.png');
const imageBitcoin = require('../../assets/illustrations/b-emboss.png');

const backupSeedPhraseTodo: ITodo = {
	id: 'backupSeedPhrase',
	color: 'blue',
	image: imageSafe,
	dismissable: true,
};
const lightningTodo: ITodo = {
	id: 'lightning',
	color: 'purple',
	image: imageLightning,
	dismissable: true,
};
const lightningSettingUpTodo: ITodo = {
	id: 'lightningSettingUp',
	color: 'purple',
	image: imageLightning,
	dismissable: false,
};
const transferTodo: ITodo = {
	id: 'transfer',
	color: 'purple',
	image: imageTransfer,
	dismissable: true,
};
const transferToSpendingTodo: ITodo = {
	id: 'transferToSpending',
	color: 'purple',
	image: imageTransfer,
	dismissable: false,
};
const transferToSavingsTodo: ITodo = {
	id: 'transferToSavings',
	color: 'purple',
	image: imageTransfer,
	dismissable: false,
};
const transferClosingChannel: ITodo = {
	id: 'transferClosingChannel',
	color: 'purple',
	image: imageTransfer,
	dismissable: false,
};
const pinTodo: ITodo = {
	id: 'pin',
	color: 'green',
	image: imageShield,
	dismissable: true,
};
const slashtagsProfileTodo: ITodo = {
	id: 'slashtagsProfile',
	color: 'brand',
	image: imageCrown,
	dismissable: true,
};
const buyBitcoinTodo: ITodo = {
	id: 'buyBitcoin',
	color: 'orange',
	image: imageBitcoin,
	dismissable: true,
};

export const allTodos = [
	backupSeedPhraseTodo,
	lightningTodo,
	lightningSettingUpTodo,
	transferTodo,
	transferToSpendingTodo,
	transferToSavingsTodo,
	transferClosingChannel,
	pinTodo,
	slashtagsProfileTodo,
	buyBitcoinTodo,
];

const defaultTodos = [
	backupSeedPhraseTodo.id,
	lightningTodo.id,
	pinTodo.id,
	slashtagsProfileTodo.id,
	buyBitcoinTodo.id,
];

export const todoSortinOrder: TTodoType[] = [
	'backupSeedPhrase',
	'lightning',
	'lightningSettingUp',
	'transfer',
	'transferToSpending',
	'transferToSavings',
	'transferClosingChannel',
	'pin',
	'slashtagsProfile',
	'buyBitcoin',
];

export const defaultTodosShape: TTodoType[] = defaultTodos;
