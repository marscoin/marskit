import React, { ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import WelcomeScreen from '../../screens/Onboarding/Welcome';
import OnboardingCreateAccountScreen from '../../screens/Onboarding/CreateAccount';
import OnboardingRestoreAccountScreen from '../../screens/Onboarding/RestoreAccount';

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
					name="CreateAccount"
					component={OnboardingCreateAccountScreen}
					options={navOptionHandler}
				/>
				<Stack.Screen
					name="RestoreAccount"
					component={OnboardingRestoreAccountScreen}
					options={navOptionHandler}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default OnboardingNavigator;
