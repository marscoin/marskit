import React, { ReactElement, useCallback, useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalletsScreen from '../../screens/Wallets';
import ProfileScreen from '../../screens/Profile';
import ProfileDetail from '../../screens/Profile/ProfileDetail';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import themes from '../../styles/themes';
import QR from '../../components/QR';
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
import { Platform } from 'react-native';
import { toggleView } from '../../store/actions/user';

const Tab = createBottomTabNavigator();
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

const modalOptions = {
	...navOptions,
	...TransitionPresets.ModalSlideFromBottomIOS,
};

const WalletsStack = (): ReactElement => {
	return (
		<Stack.Navigator initialRouteName="Wallets" screenOptions={navOptions}>
			<Stack.Screen
				name="Wallets"
				component={WalletsScreen}
				options={screenOptions}
			/>
			<Stack.Group screenOptions={modalOptions}>
				<Stack.Screen
					name="BitcoinToLightning"
					component={BitcoinToLightningModal}
				/>
				<Stack.Screen name="QR" component={QR} />
				<Stack.Screen name="AuthCheck" component={AuthCheck} />
			</Stack.Group>
		</Stack.Navigator>
	);
};

const ProfileStack = (): ReactElement => {
	return (
		<Stack.Navigator initialRouteName="Profile">
			<Stack.Group screenOptions={screenOptions}>
				<Stack.Screen name="Profile" component={ProfileScreen} />
				<Stack.Screen name="ProfileDetail" component={ProfileDetail} />
			</Stack.Group>
		</Stack.Navigator>
	);
};

const activeTintColor = '#E94D27';
const TabNavigator = (): ReactElement => {
	const settings = useSelector((state: Store) => state.settings);
	const theme = useMemo(() => themes[settings.theme], [settings.theme]);
	const tabBackground = useMemo(
		() => theme.colors.tabBackground,
		[theme.colors.tabBackground],
	);
	const insets = useSafeAreaInsets();
	const tabScreenOptions = useMemo(() => {
		return {
			tabBarShowLabel: false,
			tabBarHideOnKeyboard: true,
			headerShown: false,
			tabBarActiveTintColor: activeTintColor,
			tabBarInactiveTintColor: '#636366',
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
	}, [insets.bottom, tabBackground]);

	const WalletIcon = useCallback(
		({ size, color }): ReactElement => (
			<SvgXml xml={walletIcon(color)} width={size} height={size} />
		),
		[],
	);

	const walletOptions = useMemo(() => {
		return {
			tabBarIcon: WalletIcon,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const SendIcon = useCallback(
		({ size, color }): ReactElement => (
			<SvgXml xml={sendIcon(color)} width={size} height={size} />
		),
		[],
	);

	const sendOptions = useMemo(() => {
		return {
			tabBarIcon: SendIcon,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const ReceiveIcon = useCallback(
		({ size, color }): ReactElement => (
			<SvgXml xml={receiveIcon(color)} width={size} height={size} />
		),
		[],
	);

	const receiveOptions = useMemo(() => {
		return {
			tabBarIcon: ReceiveIcon,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const ProfileIcon = useCallback(
		({ size, color }): ReactElement => (
			<SvgXml xml={profileIcon(color)} width={size} height={size} />
		),
		[],
	);

	const profileOptions = useMemo(() => {
		return {
			tabBarIcon: ProfileIcon,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onReceivePress = useCallback((event) => {
		toggleView({
			view: 'receive',
			data: {
				isOpen: true,
				snapPoint: 1,
				assetName: 'bitcoin',
			},
		}).then();
		event.preventDefault();
	}, []);

	const receiveListeners = useCallback(
		(): { tabPress } => ({
			tabPress: onReceivePress,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const onSendPress = useCallback((event) => {
		toggleView({
			view: 'send',
			data: {
				isOpen: true,
				snapPoint: 0,
				assetName: 'bitcoin',
			},
		}).then();
		event.preventDefault();
	}, []);

	const sendListeners = useCallback(
		(): { tabPress } => ({
			tabPress: onSendPress,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	return (
		<Tab.Navigator>
			{/*@ts-ignore*/}
			<Tab.Group screenOptions={tabScreenOptions}>
				<Tab.Screen
					name={'WalletsStack'}
					component={WalletsStack}
					options={walletOptions}
				/>
				<Tab.Screen
					name={'Send'}
					component={View}
					options={sendOptions}
					listeners={sendListeners}
				/>
				<Tab.Screen
					name={'Receive'}
					component={View}
					options={receiveOptions}
					listeners={receiveListeners}
				/>
				<Tab.Screen
					name={'ProfileStack'}
					component={ProfileStack}
					options={profileOptions}
				/>
			</Tab.Group>
		</Tab.Navigator>
	);
};

export default TabNavigator;
