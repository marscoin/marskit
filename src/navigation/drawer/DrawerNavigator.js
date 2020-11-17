import React, { memo } from "react";
import TabNavigator from "../tabs/TabNavigator";
import Settings from "../../screens/Settings";
import { createDrawerNavigator } from "@react-navigation/drawer";

const Drawer = createDrawerNavigator();

const screenOptions = {
	headerShown: false,
	gestureEnabled: true
};

const navOptionHandler = () => ({
	detachPreviousScreen: false
});

const DrawerNavigator = () => {
	return (
		<Drawer.Navigator
			screenOptions={screenOptions}
			initialRouteName="Wallets"
			drawerContent={(props) => <Settings {...props} />}
			drawerPosition="right"
			drawerStyle={{ width: "100%" }}
		>
			<Drawer.Screen name="Wallets" component={TabNavigator} options={navOptionHandler} />
		</Drawer.Navigator>
	);
};

export default memo(DrawerNavigator);
