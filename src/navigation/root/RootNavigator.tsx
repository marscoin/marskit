import React, { ReactElement, useCallback, useMemo } from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from '../tabs/TabNavigator';
import Biometrics from '../../components/Biometrics';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import AuthCheck from '../../components/AuthCheck';
import Blocktank from '../../screens/Blocktank';
import BlocktankOrder from '../../screens/Blocktank/OrderService';
import BlocktankPayment from '../../screens/Blocktank/Payment';
import ActivityDetail from '../../screens/Activity/ActivityDetail';
import ActivityFiltered from '../../screens/Activity/ActivityFiltered';
import ActivityTagsPrompt from '../../screens/Activity/ActivityTagsPrompt';
import ScannerScreen from '../../screens/Scanner';
import WalletsDetail from '../../screens/Wallets/WalletsDetail';
import SendBottomSheet from '../../screens/Wallets/Send/SendBottomSheet';
import SettingsNavigator from '../settings/SettingsNavigator';
import ProfileNavigator from '../profile/ProfileNavigator';
import SendAssetPicker from '../bottom-sheet/SendAssetPicker';
import SendNavigation from '../bottom-sheet/SendNavigation';
import ReceiveNavigation from '../bottom-sheet/ReceiveNavigation';
import BackupNavigation from '../bottom-sheet/BackupNavigation';
import PINNavigation from '../bottom-sheet/PINNavigation';
import { NavigationContainer } from '../../styles/components';
import CoinSelection from '../../screens/Wallets/SendOnChainTransaction/CoinSelection';
import LightningNavigator from '../lightning/LightningNavigator';
import OnChainNumberPad from '../../screens/Wallets/SendOnChainTransaction/OnChainNumberPad';
import FeeNumberPad from '../../screens/Wallets/SendOnChainTransaction2/FeeNumberPad';
import PINPrompt from '../../screens/Settings/PIN/PINPrompt';
import BoostPrompt from '../../screens/Wallets/BoostPrompt';

const Stack = createNativeStackNavigator();

const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachInactiveScreens: true,
};

export type TInitialRoutes = 'Tabs' | 'RootAuthCheck';
const RootNavigator = (): ReactElement => {
	const pin = useSelector((state: Store) => state.settings.pin);
	const pinOnLaunch = useSelector((state: Store) => state.settings.pinOnLaunch);
	const initialRouteName = useMemo(
		() => (pin && pinOnLaunch ? 'RootAuthCheck' : 'Tabs'),
		[pin, pinOnLaunch],
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
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={navOptions}
				initialRouteName={initialRouteName}>
				<Stack.Group screenOptions={navOptions}>
					<Stack.Screen name="RootAuthCheck" component={AuthCheckComponent} />
					<Stack.Screen name="Tabs" component={TabNavigator} />
					<Stack.Screen name="Biometrics" component={BiometricsComponent} />
					<Stack.Screen name="Blocktank" component={Blocktank} />
					<Stack.Screen name="BlocktankOrder" component={BlocktankOrder} />
					<Stack.Screen name="BlocktankPayment" component={BlocktankPayment} />
					<Stack.Screen name="ActivityDetail" component={ActivityDetail} />
					<Stack.Screen name="ActivityFiltered" component={ActivityFiltered} />
					<Stack.Screen name="Scanner" component={ScannerScreen} />
					<Stack.Screen name="WalletsDetail" component={WalletsDetail} />
					<Stack.Screen name="LightningRoot" component={LightningNavigator} />
					<Stack.Screen name="Settings" component={SettingsNavigator} />
				</Stack.Group>
				<Stack.Group screenOptions={{ ...navOptions, presentation: 'modal' }}>
					<Stack.Screen name="ProfileRoot" component={ProfileNavigator} />
				</Stack.Group>
			</Stack.Navigator>
			<SendBottomSheet />
			<SendNavigation />
			<ReceiveNavigation />
			<BackupNavigation />
			<PINNavigation />

			<SendAssetPicker />
			<CoinSelection />
			<OnChainNumberPad />
			<FeeNumberPad />
			<PINPrompt />
			<BoostPrompt />
			<ActivityTagsPrompt />
		</NavigationContainer>
	);
};

export default RootNavigator;
