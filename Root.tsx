import React, { ReactElement } from 'react';
import { View, StyleSheet } from 'react-native';
import App from './src/App';
import ErrorBoundary from './src/ErrorBoundary';
import store from './src/store';
import { PersistGate } from 'redux-persist/integration/react';
import { enableScreens, enableFreeze } from 'react-native-screens';

enableScreens(true);
enableFreeze(true);

const Provider = require('react-redux').Provider;
const { persistStore } = require('redux-persist');
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

export default Root;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
