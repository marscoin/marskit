import { PersistedState } from 'redux-persist';
import { defaultActivityShape } from '../shapes/activity';
import { defaultTodosShape } from '../shapes/todos';
import { defaultViewControllers } from '../shapes/ui';
import { defaultChecksShape } from '../shapes/checks';
import { defaultBackupShape } from '../shapes/backup';

// add migrations for every persisted store version change
// NOTE: state reconciliation works only 2 levels deep
// see https://github.com/rt2zz/redux-persist#state-reconciler

const migrations = {
	0: (state): PersistedState => {
		return {
			...state,
			todos: defaultTodosShape,
		};
	},
	1: (state): PersistedState => {
		return {
			...state,
			todos: defaultTodosShape,
		};
	},
	2: (state): PersistedState => {
		const sortOrder = Object.keys(state.widgets.widgets);

		return {
			...state,
			widgets: {
				...state.widgets,
				sortOrder,
			},
		};
	},
	3: (state): PersistedState => {
		return {
			...state,
			todos: defaultTodosShape,
			user: {
				...state.user,
				startCoopCloseTimestamp: 0,
				viewController: defaultViewControllers,
			},
		};
	},
	4: (state): PersistedState => {
		return {
			...state,
			user: {
				...state.user,
				ignoreAppUpdateTimestamp: 0,
			},
		};
	},
	5: (state): PersistedState => {
		return {
			...state,
			todos: defaultTodosShape,
		};
	},
	6: (state): PersistedState => {
		return {
			...state,
			activity: defaultActivityShape,
		};
	},
	7: (state): PersistedState => {
		return {
			...state,
			settings: {
				...state.settings,
				customFeeRate: 0,
			},
		};
	},
	8: (state): PersistedState => {
		return {
			...state,
			todos: defaultTodosShape,
		};
	},
	9: (state): PersistedState => {
		return {
			...state,
			checks: defaultChecksShape,
		};
	},
	10: (state): PersistedState => {
		// remove lnurlpay from receivePreference
		const receivePreference = state.settings.receivePreference.filter(
			(i) => i.key !== 'lnurlpay',
		);

		return {
			...state,
			settings: {
				...state.settings,
				receivePreference,
			},
		};
	},
	11: (state): PersistedState => {
		return {
			...state,
			backup: {
				...defaultBackupShape,
				...state.backup,
			},
		};
	},
};

export default migrations;
