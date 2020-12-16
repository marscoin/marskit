import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
	createStackNavigator,
	TransitionPresets,
} from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import WalletsScreen from '../../screens/Wallets';
import WalletsDetail from '../../screens/Wallets/WalletsDetail';
import ProfileScreen from '../../screens/Profile';
import ProfileDetail from '../../screens/Profile/ProfileDetail';
import HistoryScreen from '../../screens/History';
import HistoryDetail from '../../screens/History/HistoryDetail';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import themes from '../../styles/themes';
import Receive from '../../screens/Wallets/Receive';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const navOptionHandler = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachPreviousScreen: false,
};

const WalletsStack = () => {
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
				name="ReceiveAsset"
				component={Receive}
				options={{
					...navOptionHandler,
					...TransitionPresets.ModalSlideFromBottomIOS,
				}}
			/>
		</Stack.Navigator>
	);
};

const ProfileStack = () => {
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

const HistoryStack = () => {
	return (
		<Stack.Navigator initialRouteName="History">
			<Stack.Screen
				name="History"
				component={HistoryScreen}
				options={navOptionHandler}
			/>
			<Stack.Screen
				name="HistoryDetail"
				component={HistoryDetail}
				options={navOptionHandler}
			/>
		</Stack.Navigator>
	);
};

const TabNavigator = () => {
	const settings = useSelector((state: Store) => state.settings);
	const theme = themes[settings.theme];
	const activeTintColor = theme.colors.text;
	const backgroundColor = theme.colors.background;
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => {
					let iconName;
					switch (route.name) {
						case 'Wallets':
							iconName = focused ? 'wallet' : 'wallet-outline';
							break;
						case 'Profile':
							iconName = focused ? 'person-circle' : 'person-circle-outline';
							break;
						case 'History':
							iconName = focused ? 'notifications-circle' : 'notifications';
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
			<Tab.Screen name="Wallets" component={WalletsStack} />
			<Tab.Screen name="Profile" component={ProfileStack} />
			<Tab.Screen name="History" component={HistoryStack} />
		</Tab.Navigator>
	);
};

export default TabNavigator;
