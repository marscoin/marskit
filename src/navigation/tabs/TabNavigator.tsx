import React, { ReactElement } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
	createStackNavigator,
	TransitionPresets,
} from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import WalletsScreen from '../../screens/Wallets';
import WalletsDetail from '../../screens/Wallets/WalletsDetail';
import ProfileScreen from '../../screens/Profile';
import ProfileDetail from '../../screens/Profile/ProfileDetail';
import ActivityDetail from '../../screens/Activity/ActivityDetail';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import themes from '../../styles/themes';
import QR from '../../components/QR';
import ScannerScreen from '../../screens/Scanner';
import SendOnChainTransaction from '../../screens/Wallets/SendOnChainTransaction';
import { View } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const navOptionHandler = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachPreviousScreen: false,
};

const WalletsStack = (): ReactElement => {
	return (
		<Stack.Navigator initialRouteName="Wallets">
			<Stack.Screen
				name="Wallets"
				component={WalletsScreen}
				options={navOptionHandler}
			/>
			<Stack.Screen
				name="WalletsDetail"
				component={WalletsDetail}
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
				name="QR"
				component={QR}
				options={{
					...navOptionHandler,
					...TransitionPresets.ModalSlideFromBottomIOS,
				}}
			/>
			<Stack.Screen
				name="Scanner"
				component={ScannerScreen}
				options={{
					...navOptionHandler,
					...TransitionPresets.ModalSlideFromBottomIOS,
				}}
			/>
			<Stack.Screen
				name="ActivityDetail"
				component={ActivityDetail}
				options={navOptionHandler}
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
	const activeTintColor = theme.colors.text;
	const backgroundColor = theme.colors.background;
	const { t } = useTranslation();
	return (
		<Tab.Navigator
			screenOptions={({
				route,
			}): {
				tabBarIcon: ({
					focused,
					color,
					size,
				}: {
					focused: boolean;
					color: string;
					size: number;
				}) => ReactElement;
			} => ({
				tabBarIcon: ({ focused, color, size }): ReactElement => {
					let iconName;

					switch (route.name) {
						case t('wallets'):
							iconName = focused ? 'wallet' : 'wallet-outline';
							break;
						case t('scan'):
							iconName = focused ? 'qr-code' : 'qr-code-outline';
							break;
						case t('profile'):
							iconName = focused ? 'person-circle' : 'person-circle-outline';
							break;
					}
					return <Ionicons name={iconName} size={size} color={color} />;
				},
			})}
			tabBarOptions={{
				activeTintColor,
				inactiveTintColor: 'gray',
				activeBackgroundColor: backgroundColor,
				inactiveBackgroundColor: backgroundColor,
				labelStyle: {
					fontSize: 14,
					paddingBottom: 4,
				},
				style: { height: '8%' },
				keyboardHidesTabBar: true,
			}}>
			<Tab.Screen name={t('wallets')} component={WalletsStack} />
			<Tab.Screen
				name={t('scan')}
				component={View}
				listeners={({ navigation }) => ({
					tabPress: (event) => {
						event.preventDefault();
						navigation.navigate('Scanner');
					},
				})}
			/>
			<Tab.Screen name={t('profile')} component={ProfileStack} />
		</Tab.Navigator>
	);
};

export default TabNavigator;
