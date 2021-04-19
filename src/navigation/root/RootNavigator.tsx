import React, { ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import DrawerNavigator from '../drawer/DrawerNavigator';
import TempSettings from '../../screens/Settings/TempSettings';
import BackupSettings from '../../screens/Settings/Backup';
import LightningInfo from '../../screens/Settings/Lightning/LightningInfo';
import LndLogs from '../../screens/Settings/Lightning/LndLogs';
import ManageSeedPhrase from '../../screens/Settings/ManageSeedPhrase';
import PinPad from '../../components/PinPad';
import { useSelector } from 'react-redux';
import Store from '../../store/types';

const Stack = createNativeStackNavigator();

const navOptionHandler = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachPreviousScreen: false,
};

const RootNavigator = (): ReactElement => {
	const hasPin = useSelector((state: Store) => state.settings.pin);
	const initialRouteName = hasPin ? 'StartPin' : 'Drawer';
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName={initialRouteName}>
				<Stack.Screen
					name="Drawer"
					component={DrawerNavigator}
					options={navOptionHandler}
				/>
				<Stack.Screen
					name="TempSettings"
					component={TempSettings}
					options={navOptionHandler}
				/>
				<Stack.Screen name="StartPin" options={navOptionHandler}>
					{({ navigation }): ReactElement => (
						<PinPad
							onSuccess={(): void => {
								navigation.navigate('Drawer');
							}}
							pinSetup={false}
							displayBackButton={false}
						/>
					)}
				</Stack.Screen>
				<Stack.Screen
					name="Pin"
					component={PinPad}
					options={navOptionHandler}
				/>
				<Stack.Screen
					name="BackupSettings"
					component={BackupSettings}
					options={navOptionHandler}
				/>
				<Stack.Screen
					name="TempLightningOptions"
					component={LightningInfo}
					options={navOptionHandler}
				/>
				<Stack.Screen
					name="LndLogs"
					component={LndLogs}
					options={navOptionHandler}
				/>
				<Stack.Screen
					name="ManageSeedPhrase"
					component={ManageSeedPhrase}
					options={navOptionHandler}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default RootNavigator;
