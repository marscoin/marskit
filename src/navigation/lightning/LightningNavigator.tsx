import React, { ReactElement } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TransitionPresets } from '@react-navigation/stack';

import LightningScreen from '../../screens/Lightning';

const Stack = createNativeStackNavigator();

const transitionPreset =
	Platform.OS === 'ios'
		? TransitionPresets.SlideFromRightIOS
		: TransitionPresets.DefaultTransition;

const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...transitionPreset,
	detachInactiveScreens: true,
};

const screenOptions = {
	...navOptions,
};

const LightningStack = (): ReactElement => {
	return (
		<Stack.Navigator initialRouteName="Lightning">
			<Stack.Group screenOptions={screenOptions}>
				<Stack.Screen name="Lightning" component={LightningScreen} />
			</Stack.Group>
		</Stack.Navigator>
	);
};

export default LightningStack;
