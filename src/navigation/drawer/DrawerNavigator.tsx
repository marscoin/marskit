import React, { ReactElement } from 'react';
import TabNavigator from '../tabs/TabNavigator';
import Settings from '../../screens/Settings';
import {
	createDrawerNavigator,
	DrawerNavigationOptions,
} from '@react-navigation/drawer';
import { StyleSheet } from 'react-native';

const Drawer = createDrawerNavigator();

const screenOptions: DrawerNavigationOptions = {
	headerShown: false,
	gestureEnabled: true,
	drawerPosition: 'right',
};

const DrawerNavigator = (): ReactElement => {
	return (
		<Drawer.Navigator
			screenOptions={{
				...screenOptions,
				drawerStyle: styles.drawer,
			}}
			initialRouteName="Wallets"
			drawerContent={(props): ReactElement => <Settings {...props} />}>
			<Drawer.Screen name="Wallets" component={TabNavigator} />
		</Drawer.Navigator>
	);
};

const styles = StyleSheet.create({
	drawer: {
		width: '100%',
	},
});

export default DrawerNavigator;
