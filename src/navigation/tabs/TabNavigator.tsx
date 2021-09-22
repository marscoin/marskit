import React, { ReactElement } from 'react';
import {
	BottomTabNavigationOptions,
	createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
	createStackNavigator,
	TransitionPresets,
} from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import WalletsScreen from '../../screens/Wallets';
import ProfileScreen from '../../screens/Profile';
import ProfileDetail from '../../screens/Profile/ProfileDetail';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import themes from '../../styles/themes';
import QR from '../../components/QR';
import SendOnChainTransaction from '../../screens/Wallets/SendOnChainTransaction';
import BitcoinToLightningModal from '../../screens/Wallets/SendOnChainTransaction/BitcoinToLightningModal';
import { View } from '../../styles/components';
import AuthCheck from '../../components/AuthCheck';
import { SvgXml } from 'react-native-svg';
import {
	profileIcon,
	receiveIcon,
	sendIcon,
	walletIcon,
} from '../../assets/icons/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const navOptionHandler = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachInactiveScreens: true,
};

const WalletsStack = (): ReactElement => {
	return (
		<Stack.Navigator
			initialRouteName="Wallets"
			screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="Wallets"
				component={WalletsScreen}
				options={navOptionHandler}
			/>
			<Stack.Screen
				name="SendOnChainTransaction"
				component={SendOnChainTransaction}
				options={{
					...navOptionHandler,
					...TransitionPresets.ModalSlideFromBottomIOS,
				}}
			/>
			<Stack.Screen
				name="BitcoinToLightning"
				component={BitcoinToLightningModal}
				options={{
					...navOptionHandler,
					...TransitionPresets.ModalSlideFromBottomIOS,
				}}
			/>
			<Stack.Screen
				name="QR"
				component={QR}
				options={{
					...navOptionHandler,
					...TransitionPresets.ModalSlideFromBottomIOS,
				}}
			/>
			<Stack.Screen
				name="AuthCheck"
				component={AuthCheck}
				options={{
					...navOptionHandler,
					...TransitionPresets.ModalSlideFromBottomIOS,
				}}
			/>
		</Stack.Navigator>
	);
};

const ProfileStack = (): ReactElement => {
	return (
		<Stack.Navigator initialRouteName="Profile">
			<Stack.Screen
				name="Profile"
				component={ProfileScreen}
				options={navOptionHandler}
			/>
			<Stack.Screen
				name="ProfileDetail"
				component={ProfileDetail}
				options={navOptionHandler}
			/>
		</Stack.Navigator>
	);
};

const TabNavigator = (): ReactElement => {
	const settings = useSelector((state: Store) => state.settings);
	const theme = themes[settings.theme];
	const activeTintColor = '#E94D27';
	const tabBackground = theme.colors.tabBackground;
	const { t } = useTranslation();

	const insets = useSafeAreaInsets();

	const options: BottomTabNavigationOptions = {
		tabBarShowLabel: false,
		tabBarHideOnKeyboard: true,
		headerShown: false,
		tabBarActiveTintColor: activeTintColor,
		tabBarInactiveTintColor: '#636366',
		//activeBackgroundColor: backgroundColor,
		//inactiveBackgroundColor: backgroundColor,
		tabBarStyle: {
			height: 60,
			position: 'absolute',
			bottom: Math.max(insets.bottom, 18),
			left: 48,
			right: 48,
			backgroundColor: tabBackground,
			borderRadius: 44,
			borderTopWidth: 0,
			elevation: 0,
			paddingTop: insets.bottom - 5,
		},
	};

	return (
		<Tab.Navigator>
			<Tab.Screen
				name={t('wallets')}
				component={WalletsStack}
				options={{
					...options,
					tabBarIcon: ({ size, color }): ReactElement => (
						<SvgXml xml={walletIcon(color)} width={size} height={size} />
					),
				}}
			/>
			<Tab.Screen
				name={t('send')}
				component={View}
				options={{
					...options,
					tabBarIcon: ({ size, color }): ReactElement => (
						<SvgXml xml={sendIcon(color)} width={size} height={size} />
					),
				}}
			/>
			<Tab.Screen
				name={t('receive')}
				component={View}
				options={{
					...options,
					tabBarIcon: ({ size, color }): ReactElement => (
						<SvgXml xml={receiveIcon(color)} width={size} height={size} />
					),
				}}
			/>
			<Tab.Screen
				name={t('profile')}
				component={ProfileStack}
				options={{
					...options,
					tabBarIcon: ({ size, color }): ReactElement => (
						<SvgXml xml={profileIcon(color)} width={size} height={size} />
					),
				}}
			/>
		</Tab.Navigator>
	);
};

export default TabNavigator;
