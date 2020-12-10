import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { TransitionPresets } from "@react-navigation/stack";
import { createNativeStackNavigator } from "react-native-screens/native-stack";
import DrawerNavigator from "../drawer/DrawerNavigator";
import TempSettings from "../../screens/Settings/TempSettings";
import LightningInfo from '../../screens/Settings/Lightning/LightningInfo';
import LndLogs from '../../screens/Settings/Lightning/LndLogs';

const Stack = createNativeStackNavigator();

const navOptionHandler = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachPreviousScreen: false
};

const RootNavigator = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Drawer">
				<Stack.Screen name="Drawer" component={DrawerNavigator} options={navOptionHandler} />
				<Stack.Screen name="TempSettings" component={TempSettings} options={navOptionHandler} />
				<Stack.Screen name="TempLightningOptions" component={LightningInfo} options={navOptionHandler} />
				<Stack.Screen name="LndLogs" component={LndLogs} options={navOptionHandler} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default RootNavigator;
