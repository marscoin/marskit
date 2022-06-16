import React, { ReactElement } from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../../screens/Onboarding/Welcome';
import SlideshowScreen from '../../screens/Onboarding/Slideshow';
import RestoreFromSeed from '../../screens/Onboarding/RestoreFromSeed';
import { NavigationContainer } from '../../styles/components';
const Stack = createNativeStackNavigator();

const navOptionHandler = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachPreviousScreen: false,
};

const OnboardingNavigator = (): ReactElement => {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Welcome">
				<Stack.Screen
					name="Welcome"
					component={WelcomeScreen}
					options={navOptionHandler}
				/>
				<Stack.Screen
					name="Slideshow"
					component={SlideshowScreen}
					options={navOptionHandler}
				/>
				<Stack.Screen
					name="RestoreFromSeed"
					component={RestoreFromSeed}
					options={navOptionHandler}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default OnboardingNavigator;
