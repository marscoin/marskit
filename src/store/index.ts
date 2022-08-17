import { configureStore } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react-native';
import logger from 'redux-logger';
import {
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from 'redux-persist';

import mmkvStorage from './mmkv-storage';
import reducers from './reducers';

const __JEST__ = process.env.JEST_WORKER_ID !== undefined;

// Switch off logging for unit tests and prod env
const devMiddleware = __DEV__ && !__JEST__ ? [logger] : [];
const sentryReduxEnhancer = Sentry.createReduxEnhancer();

const persistConfig = { key: 'root', storage: mmkvStorage };
const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
	reducer: persistedReducer,
	enhancers: [sentryReduxEnhancer],
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			// specifically ignore redux-persist action types
			// https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}).concat(devMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
