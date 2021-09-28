import React, { ReactElement, useMemo, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
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
import Receive from '../../screens/Wallets/Receive';
import {
	profileIcon,
	receiveIcon,
	sendIcon,
	walletIcon,
} from '../../assets/icons/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import Send from '../../screens/Wallets/Send';
import BottomSheetWrapper from '../../components/BottomSheetWrapper';

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
	const sendRef = useRef(null);
	const receiveRef = useRef(null);
	const settings = useSelector((state: Store) => state.settings);
	const theme = useMemo(() => themes[settings.theme], [settings.theme]);
	const tabBackground = useMemo(
		() => theme.colors.tabBackground,
		[theme.colors.tabBackground],
	);
	const { t } = useTranslation();
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

	return (
		<>
			<Tab.Navigator>
				{/*@ts-ignore*/}
				<Tab.Group screenOptions={tabScreenOptions}>
					<Tab.Screen
						name={t('wallets')}
						component={WalletsStack}
						options={{
							tabBarIcon: ({ size, color }): ReactElement => (
								<SvgXml xml={walletIcon(color)} width={size} height={size} />
							),
						}}
					/>
					<Tab.Screen
						name={t('send')}
						component={View}
						options={{
							tabBarIcon: ({ size, color }): ReactElement => (
								<SvgXml xml={sendIcon(color)} width={size} height={size} />
							),
						}}
						listeners={(): { tabPress } => ({
							tabPress: (event): void => {
								// @ts-ignore
								sendRef.current.expand();
								event.preventDefault();
							},
						})}
					/>
					<Tab.Screen
						name={t('receive')}
						component={View}
						options={{
							tabBarIcon: ({ size, color }): ReactElement => (
								<SvgXml xml={receiveIcon(color)} width={size} height={size} />
							),
						}}
						listeners={(): { tabPress } => ({
							tabPress: (event): void => {
								// @ts-ignore
								receiveRef.current.snapToIndex(1);
								event.preventDefault();
							},
						})}
					/>
					<Tab.Screen
						name={t('profile')}
						component={ProfileStack}
						options={{
							tabBarIcon: ({ size, color }): ReactElement => (
								<SvgXml xml={profileIcon(color)} width={size} height={size} />
							),
						}}
					/>
				</Tab.Group>
			</Tab.Navigator>
			<BottomSheetWrapper ref={sendRef}>
				<Send
					onComplete={(): void => {
						//@ts-ignore
						sendRef.current.close();
					}}
				/>
			</BottomSheetWrapper>
			<BottomSheetWrapper ref={receiveRef}>
				<Receive />
			</BottomSheetWrapper>
		</>
	);
};

export default TabNavigator;
