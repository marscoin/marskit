import React, { ReactElement, useCallback, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from '../tabs/TabNavigator';
import PinPad from '../../components/PinPad';
import Biometrics from '../../components/Biometrics';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import AuthCheck from '../../components/AuthCheck';
import Blocktank from '../../screens/Blocktank';
import BlocktankOrder from '../../screens/Blocktank/OrderService';
import BlocktankPayment from '../../screens/Blocktank/Payment';
import ActivityDetail from '../../screens/Activity/ActivityDetail';
import ScannerScreen from '../../screens/Scanner';
import WalletsDetail from '../../screens/Wallets/WalletsDetail';
import SendBottomSheet from '../../screens/Wallets/Send/SendBottomSheet';
import ReceiveBottomSheet from '../../screens/Wallets/Receive/ReceiveBottomSheet';
import SettingsNavigator from '../settings/SettingsNavigator';
import ReceiveAssetPicker from '../bottom-sheet/ReceiveAssetPicker';
import SendAssetPicker from '../bottom-sheet/SendAssetPicker';

const Stack = createNativeStackNavigator();

const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachInactiveScreens: true,
};

export type TInitialRoutes = 'Tabs' | 'RootAuthCheck';
const RootNavigator = (): ReactElement => {
	const hasPin = useSelector((state: Store) => state.settings.pin);
	const hasBiometrics = useSelector(
		(state: Store) => state.settings.biometrics,
	);
	const initialRouteName = useMemo(
		() => (hasPin || hasBiometrics ? 'RootAuthCheck' : 'Tabs'),
		[hasBiometrics, hasPin],
	);

	const AuthCheckComponent = useCallback(({ navigation }): ReactElement => {
		return (
			<AuthCheck
				onSuccess={(): void => {
					navigation.replace('Tabs');
				}}
			/>
		);
	}, []);

	const StartPinComponent = useCallback(
		({ navigation }): ReactElement => {
			return (
				<PinPad
					onSuccess={(): void => {
						if (hasBiometrics) {
							navigation.navigate('Biometrics');
						} else {
							navigation.replace('Tabs');
						}
					}}
					pinSetup={false}
					displayBackButton={false}
				/>
			);
		},
		[hasBiometrics],
	);

	const BiometricsComponent = useCallback(({ navigation }): ReactElement => {
		return (
			<Biometrics
				onSuccess={(): void => {
					navigation.replace('Tabs');
				}}
			/>
		);
	}, []);

	return (
		<NavigationContainer independent={true}>
			<Stack.Navigator
				screenOptions={navOptions}
				initialRouteName={initialRouteName}>
				<Stack.Group screenOptions={navOptions}>
					<Stack.Screen name="RootAuthCheck" component={AuthCheckComponent} />
					<Stack.Screen name="Tabs" component={TabNavigator} />
					<Stack.Screen name="StartPin" component={StartPinComponent} />
					<Stack.Screen name="Biometrics" component={BiometricsComponent} />
					<Stack.Screen name="Blocktank" component={Blocktank} />
					<Stack.Screen name="BlocktankOrder" component={BlocktankOrder} />
					<Stack.Screen name="BlocktankPayment" component={BlocktankPayment} />
					<Stack.Screen name="ActivityDetail" component={ActivityDetail} />
					<Stack.Screen name="Scanner" component={ScannerScreen} />
					<Stack.Screen name="WalletsDetail" component={WalletsDetail} />
				</Stack.Group>
				<Stack.Group screenOptions={{ ...navOptions, presentation: 'modal' }}>
					<Stack.Screen name="Settings" component={SettingsNavigator} />
				</Stack.Group>
			</Stack.Navigator>
			<SendBottomSheet />
			<ReceiveBottomSheet />

			<ReceiveAssetPicker />
			<SendAssetPicker />
		</NavigationContainer>
	);
};

export default RootNavigator;
