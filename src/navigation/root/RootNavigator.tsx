import React, { ReactElement, useCallback, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from '../drawer/DrawerNavigator';
import TempSettings from '../../screens/Settings/TempSettings';
import ExchangeRateSettings from '../../screens/Settings/ExchangeRate';
import BackupSettings from '../../screens/Settings/Backup';
import ExportBackups from '../../screens/Settings/Backup/Export';
import LightningChannels from '../../screens/Settings/Lightning/LightningChannels';
import LightningNodeInfo from '../../screens/Settings/Lightning/LightningNodeInfo';
import LndLogs from '../../screens/Settings/Lightning/LndLogs';
import ManageSeedPhrase from '../../screens/Settings/ManageSeedPhrase';
import PinPad from '../../components/PinPad';
import Biometrics from '../../components/Biometrics';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import AuthCheck from '../../components/AuthCheck';
import CoinSelectPreference from '../../screens/Settings/CoinSelectPreference';
import LightningChannelDetails from '../../screens/Settings/Lightning/LightningChannelDetails';
import Blocktank from '../../screens/Blocktank';
import BlocktankOrder from '../../screens/Blocktank/OrderService';
import AddressTypePreference from '../../screens/Settings/AddressTypePreference';
import BlocktankPayment from '../../screens/Blocktank/Payment';
import ElectrumConfig from '../../screens/Settings/ElectrumConfig';
import ActivityDetail from '../../screens/Activity/ActivityDetail';
import ScannerScreen from '../../screens/Scanner';
import WalletsDetail from '../../screens/Wallets/WalletsDetail';
import SendBottomSheet from '../../screens/Wallets/Send/SendBottomSheet';
import ReceiveBottomSheet from '../../screens/Wallets/Receive/ReceiveBottomSheet';

const Stack = createNativeStackNavigator();

const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachInactiveScreens: true,
};

export type TInitialRoutes = 'Drawer' | 'RootAuthCheck';
const RootNavigator = (): ReactElement => {
	const hasPin = useSelector((state: Store) => state.settings.pin);
	const hasBiometrics = useSelector(
		(state: Store) => state.settings.biometrics,
	);
	const initialRouteName = useMemo(
		() => (hasPin || hasBiometrics ? 'RootAuthCheck' : 'Drawer'),
		[hasBiometrics, hasPin],
	);

	const AuthCheckComponent = useCallback(({ navigation }): ReactElement => {
		return (
			<AuthCheck
				onSuccess={(): void => {
					navigation.replace('Drawer');
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
							navigation.replace('Drawer');
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
					navigation.replace('Drawer');
				}}
			/>
		);
	}, []);

	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={navOptions}
				initialRouteName={initialRouteName}>
				<Stack.Group screenOptions={navOptions}>
					<Stack.Screen name="RootAuthCheck" component={AuthCheckComponent} />
					<Stack.Screen name="Drawer" component={DrawerNavigator} />
					<Stack.Screen name="TempSettings" component={TempSettings} />
					<Stack.Screen name="StartPin" component={StartPinComponent} />
					<Stack.Screen name="Pin" component={PinPad} />
					<Stack.Screen
						name="ExchangeRateSettings"
						component={ExchangeRateSettings}
					/>
					<Stack.Screen name="ElectrumConfig" component={ElectrumConfig} />
					<Stack.Screen name="Biometrics" component={BiometricsComponent} />
					<Stack.Screen
						name="CoinSelectPreference"
						component={CoinSelectPreference}
					/>
					<Stack.Screen
						name="AddressTypePreference"
						component={AddressTypePreference}
					/>
					<Stack.Screen name="BackupSettings" component={BackupSettings} />
					<Stack.Screen name="ExportBackups" component={ExportBackups} />
					<Stack.Screen
						name="LightningChannels"
						component={LightningChannels}
					/>
					<Stack.Screen
						name="LightningChannelDetails"
						component={LightningChannelDetails}
					/>
					<Stack.Screen
						name="LightningNodeInfo"
						component={LightningNodeInfo}
					/>
					<Stack.Screen name="LndLogs" component={LndLogs} />
					<Stack.Screen name="ManageSeedPhrase" component={ManageSeedPhrase} />
					<Stack.Screen name="Blocktank" component={Blocktank} />
					<Stack.Screen name="BlocktankOrder" component={BlocktankOrder} />
					<Stack.Screen name="BlocktankPayment" component={BlocktankPayment} />
					<Stack.Screen name="ActivityDetail" component={ActivityDetail} />
					<Stack.Screen name="Scanner" component={ScannerScreen} />
					<Stack.Screen name="WalletsDetail" component={WalletsDetail} />
				</Stack.Group>
			</Stack.Navigator>
			<SendBottomSheet />
			<ReceiveBottomSheet />
		</NavigationContainer>
	);
};

export default RootNavigator;
