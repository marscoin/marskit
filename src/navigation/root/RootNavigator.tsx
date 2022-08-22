import React, { ReactElement, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
	createStackNavigator,
	TransitionPresets,
	StackNavigationProp,
} from '@react-navigation/stack';

import TabNavigator from '../tabs/TabNavigator';
import Biometrics from '../../components/Biometrics';
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
import NewTxPrompt from '../../screens/Wallets/NewTxPrompt';
import Profile from '../../screens/Profile/Profile';
import ProfileEdit from '../../screens/Profile/ProfileEdit';
import Contacts from '../../screens/Contacts/Contacts';
import Contact from '../../screens/Contacts/Contact';
import ContactEdit from '../../screens/Contacts/ContactEdit';
import type { IActivityItem } from '../../store/types/activity';

export type RootNavigationProp = StackNavigationProp<RootStackParamList>;

export type RootStackParamList = {
	RootAuthCheck: { onSuccess: () => void };
	Tabs: undefined;
	Biometrics: undefined;
	Blocktank: undefined;
	BlocktankOrder: undefined;
	BlocktankPayment: undefined;
	ActivityDetail: { activityItem: IActivityItem };
	ActivityFiltered: undefined;
	Scanner: undefined;
	WalletsDetail: undefined;
	LightningRoot: undefined;
	Settings: undefined;
	Profile: undefined;
	ProfileEdit: undefined;
	Contacts: undefined;
	ContactEdit: undefined;
	Contact: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachInactiveScreens: true,
};

export const navigationRef: any = React.createRef();
/**
 * Helper function to navigate from utils.
 */
export const navigate = (name: string, params: object): void =>
	navigationRef.current?.navigate(name, params);

export type TInitialRoutes = 'Tabs' | 'RootAuthCheck';

const RootNavigator = (): ReactElement => {
	const pin = useSelector((state: Store) => state.settings.pin);
	const pinOnLaunch = useSelector((state: Store) => state.settings.pinOnLaunch);
	const initialRouteName: TInitialRoutes = useMemo(
		() => (pin && pinOnLaunch ? 'RootAuthCheck' : 'Tabs'),
		[pin, pinOnLaunch],
	);

	const AuthCheckComponent = useCallback(({ navigation }): ReactElement => {
		return (
			<AuthCheck
				showLogoOnPIN={true}
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
		<NavigationContainer ref={navigationRef}>
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
					<Stack.Screen
						name="Profile"
						component={Profile}
						options={{ gestureDirection: 'horizontal-inverted' }}
					/>
					<Stack.Screen name="ProfileEdit" component={ProfileEdit} />
					<Stack.Screen name="Contacts" component={Contacts} />
					<Stack.Screen name="ContactEdit" component={ContactEdit} />
					<Stack.Screen name="Contact" component={Contact} />
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
			<NewTxPrompt />
		</NavigationContainer>
	);
};

export default RootNavigator;
