import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import DrawerNavigator from "../drawer/DrawerNavigator";
import TempSettings from "../../screens/Settings/TempSettings";

const Stack = createStackNavigator();

const navOptionHandler = () => ({
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachPreviousScreen: false
});

const RootNavigator = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Drawer">
				<Stack.Screen name="Drawer" component={DrawerNavigator} options={navOptionHandler} />
				<Stack.Screen name="TempSettings" component={TempSettings} options={navOptionHandler} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default RootNavigator;
