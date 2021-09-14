import React, { ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../../screens/Onboarding/Welcome';
import OnboardingCreateAccountScreen from '../../screens/Onboarding/CreateAccount';
import OnboardingRestoreAccountScreen from '../../screens/Onboarding/RestoreAccount';
import OnboardingRestoreFromFileScreen from '../../screens/Onboarding/RestoreFromFile';
import PinPad from '../../components/PinPad';
import Biometrics, {
	IsSensorAvailableResult,
} from '../../components/Biometrics';
import { Text, TouchableOpacity } from '../../styles/components';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import ReactNativeBiometrics from 'react-native-biometrics';

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
								onPress={async (): Promise<void> => {
									const data: IsSensorAvailableResult =
										await ReactNativeBiometrics.isSensorAvailable();
									if (!data.biometryType) {
										navigation.replace('Welcome');
									} else {
										navigation.navigate('Biometrics');
									}
								}}>
								<Text>Skip</Text>
							</TouchableOpacity>
						</PinPad>
					)}
				</Stack.Screen>
				<Stack.Screen name="Biometrics" options={navOptionHandler}>
					{({ navigation }): ReactElement => (
						<Biometrics onSuccess={(): void => navigation.replace('Welcome')}>
							<TouchableOpacity
								//eslint-disable-next-line react-native/no-inline-styles
								style={{ alignItems: 'center' }}
								onPress={(): void => navigation.replace('Welcome')}>
								<Text>Skip</Text>
							</TouchableOpacity>
						</Biometrics>
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
				<Stack.Screen
					name="RestoreAccountFromFile"
					component={OnboardingRestoreFromFileScreen}
					options={navOptionHandler}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default OnboardingNavigator;
