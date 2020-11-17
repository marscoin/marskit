import React, { memo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import WalletsScreen from "../../Wallets";
import WalletsDetail from "../../Wallets/WalletsDetail";
import ProfileScreen from "../../Profile";
import ProfileDetail from "../../Profile/ProfileDetail";
import HistoryScreen from "../../History";
import HistoryDetail from "../../History/HistoryDetail";
import { useSelector } from "react-redux";

const Tab = createBottomTabNavigator();
const StackHome = createStackNavigator();
const StackSettings = createStackNavigator();
const themes = require("../../../styles/themes");

const navOptionHandler = () => ({
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachPreviousScreen: false
});

const WalletsStack = () => {
	return (
		<StackHome.Navigator initialRouteName="Wallets">
			<StackHome.Screen name="Wallets" component={WalletsScreen} options={navOptionHandler} />
			<StackHome.Screen name="WalletsDetail" component={WalletsDetail} options={navOptionHandler} />
		</StackHome.Navigator>
	);
};

const ProfileStack = () => {
	return (
		<StackSettings.Navigator initialRouteName="Profile">
			<StackSettings.Screen name="Profile" component={ProfileScreen} options={navOptionHandler} />
			<StackSettings.Screen name="ProfileDetail" component={ProfileDetail} options={navOptionHandler} />
		</StackSettings.Navigator>
	);
};

const HistoryStack = () => {
	return (
		<StackSettings.Navigator initialRouteName="History">
			<StackSettings.Screen name="History" component={HistoryScreen} options={navOptionHandler} />
			<StackSettings.Screen name="HistoryDetail" component={HistoryDetail} options={navOptionHandler} />
		</StackSettings.Navigator>
	);
};

const TabNavigator = () => {
	const settings = useSelector((state) => state.settings);
	const theme = settings.theme.id !== "dark" ? themes["light"] : themes["dark"];
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => {
					let iconName;
					switch (route.name) {
						case "Wallets":
							iconName = focused ? "wallet" : "wallet-outline";
							break;
						case "Profile":
							iconName = focused ? "person-circle" : "person-circle-outline";
							break;
						case "History":
							iconName = focused ? "notifications-circle" : "notifications";
							break;
					}
					return <Ionicons name={iconName} size={size} color={color} />;
				}
			})}
			tabBarOptions={{
				activeTintColor: theme.colors.text,
				inactiveTintColor: "gray",
				activeBackgroundColor: theme.colors.background,
				inactiveBackgroundColor: theme.colors.background,
				labelStyle:{
					fontSize: 14,
					paddingBottom: 4
				},
				style:{ height: "8%" },
				keyboardHidesTabBar: true
			}}
		>
			<Tab.Screen name="Wallets" component={WalletsStack} />
			<Tab.Screen name="Profile" component={ProfileStack} />
			<Tab.Screen name="History" component={HistoryStack} />
		</Tab.Navigator>
	);
};

export default memo(TabNavigator);
