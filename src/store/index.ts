import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { persistReducer } from 'redux-persist';
import mmkvStorage from './mmkv-storage';
import reducers from './reducers';

//Switch off logging for unit tests and prod env
const createStoreWithMiddleware = (
	process.env.JEST_WORKER_ID === undefined && __DEV__
		? applyMiddleware(thunk, logger)
		: applyMiddleware(thunk)
)(createStore);

const persistConfig = {
	key: 'root',
	storage: mmkvStorage,
};
const persistedReducer = persistReducer(persistConfig, reducers);
const store = createStoreWithMiddleware(persistedReducer);

export default store;
