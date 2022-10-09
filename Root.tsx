import React, { ReactElement } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { enableScreens, enableFreeze } from 'react-native-screens';
import { persistStore } from 'redux-persist';
import { Provider } from 'react-redux';
import { EventEmitter } from 'events';
import nodejs from 'nodejs-mobile-react-native';

import App from './src/App';
import ErrorBoundary from './src/ErrorBoundary';
import store from './src/store';

EventEmitter.defaultMaxListeners = 1000; // default is 10, but we need to listen a lot of address

// TODO: Setry needs to be removed before full release
if (!__DEV__) {
	Sentry.init({
		dsn: 'https://70caceeda5c14f4da121ef90ac0858bf@sentry.synonym.to/2',
		tracesSampleRate: 1.0,
		normalizeDepth: 10, // increase default for Redux
	});
}

nodejs.start('main.js');
enableScreens(true);
enableFreeze(true);

const persistor = persistStore(store);

const Root = (): ReactElement => {
	const content = (
		<Provider store={store}>
			<PersistGate
				loading={<View style={styles.container} />}
				persistor={persistor}>
				<App />
			</PersistGate>
		</Provider>
	);

	if (__DEV__) {
		return content;
	}

	return <ErrorBoundary>{content}</ErrorBoundary>;
};

export default Sentry.wrap(Root);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
	},
});
