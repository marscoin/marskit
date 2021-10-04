import React, { ReactElement } from 'react';
import TabNavigator from '../tabs/TabNavigator';
import Settings from '../../screens/Settings';
import {
	createDrawerNavigator,
	DrawerNavigationOptions,
} from '@react-navigation/drawer';
const Drawer = createDrawerNavigator();

const screenOptions: DrawerNavigationOptions = {
	headerShown: false,
	gestureEnabled: true,
	drawerPosition: 'left',
	drawerStyle: { width: '100%' },
};

const DrawerNavigator = (): ReactElement => {
	return (
		<Drawer.Navigator
			screenOptions={screenOptions}
			initialRouteName="TabNavigator"
			drawerContent={(props): ReactElement => <Settings {...props} />}>
			<Drawer.Screen name="TabNavigator" component={TabNavigator} />
		</Drawer.Navigator>
	);
};

export default DrawerNavigator;
