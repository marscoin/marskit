import React from "react";
import {
	View,
	StyleSheet
} from "react-native";
import App from "./src/components/App";
import { createStore, applyMiddleware } from "redux";
import reducers from "./src/reducers";
import thunk from "redux-thunk";
import logger from "redux-logger";
import { PersistGate } from "redux-persist/integration/react";
import AsyncStorage from "@react-native-community/async-storage";

const Provider = require("react-redux").Provider;
const { persistStore, persistReducer } = require("redux-persist");
const createStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore);

const persistConfig = {
	key: 'root',
	storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = createStoreWithMiddleware(persistedReducer);
const persistor = persistStore(store);

const Root = () => {
	return (
		<Provider store={store}>
			<PersistGate
				loading={<View style={styles.container} />}
				onBeforeLift={null}
				persistor={persistor}
			>
				<App />
			</PersistGate>
		</Provider>
	);
};

export default Root;

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});
