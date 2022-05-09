import React, { ReactElement } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TransitionPresets } from '@react-navigation/stack';

import ProfileScreen from '../../screens/Profile';
import UpdateProfile from '../../screens/Profile/UpdateProfile';

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

const ProfileStack = (): ReactElement => {
	return (
		<Stack.Navigator initialRouteName="Profile">
			<Stack.Group screenOptions={screenOptions}>
				<Stack.Screen name="Profile" component={ProfileScreen} />
				<Stack.Screen name="UpdateProfile" component={UpdateProfile} />
			</Stack.Group>
		</Stack.Navigator>
	);
};

export default ProfileStack;
