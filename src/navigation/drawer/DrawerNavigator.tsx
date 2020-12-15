import React from 'react';
import TabNavigator from '../tabs/TabNavigator';
import Settings from '../../screens/Settings';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet } from 'react-native';

const Drawer = createDrawerNavigator();

const screenOptions = {
	headerShown: false,
	gestureEnabled: true,
};

const DrawerNavigator = () => {
	return (
		<Drawer.Navigator
			screenOptions={screenOptions}
			initialRouteName="Wallets"
			drawerContent={(props) => <Settings {...props} />}
			drawerPosition="right"
			drawerStyle={styles.drawer}>
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
