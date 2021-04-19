import React, { ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import WelcomeScreen from '../../screens/Onboarding/Welcome';
import OnboardingCreateAccountScreen from '../../screens/Onboarding/CreateAccount';
import OnboardingRestoreAccountScreen from '../../screens/Onboarding/RestoreAccount';
import PinPad from '../../components/PinPad';
import { Text, TouchableOpacity } from '../../styles/components';
import { useSelector } from 'react-redux';
import Store from '../../store/types';

const Stack = createNativeStackNavigator();

const navOptionHandler = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachPreviousScreen: false,
};

const initialRouteName = 'Pin';

const OnboardingNavigator = (): ReactElement => {
	const hasPin = useSelector((state: Store) => state.settings.pin);
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName={initialRouteName}>
				<Stack.Screen name="Pin" options={navOptionHandler}>
					{({ navigation }): ReactElement => (
						<PinPad
							onSuccess={(): void => {
								navigation.navigate('Welcome');
							}}
							pinSetup={!hasPin}
							displayBackButton={false}>
							<TouchableOpacity
								//eslint-disable-next-line react-native/no-inline-styles
								style={{ alignItems: 'center' }}
								onPress={(): void => navigation.navigate('Welcome')}>
								<Text>Skip</Text>
							</TouchableOpacity>
						</PinPad>
					)}
				</Stack.Screen>
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
