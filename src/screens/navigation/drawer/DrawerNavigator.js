import React, { memo } from "react";
import TabNavigator from "../tabs/TabNavigator";
import Settings from "../../Settings";
import { createDrawerNavigator } from "@react-navigation/drawer";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
	return (
		<Drawer.Navigator
			initialRouteName="Wallets"
			screenOptions={{ headerShown: false }}
			drawerContent={(props) => <Settings {...props} />}
			drawerPosition="right"
			drawerStyle={{ width: "100%" }}
		>
			<Drawer.Screen name="Wallets" component={TabNavigator} />
		</Drawer.Navigator>
	);
};

export default memo(DrawerNavigator);
