import React, { ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import DrawerNavigator from '../drawer/DrawerNavigator';
import TempSettings from '../../screens/Settings/TempSettings';
import ExchangeRateSettings from '../../screens/Settings/ExchangeRate';
import BackupSettings from '../../screens/Settings/Backup';
import ExportBackups from '../../screens/Settings/Backup/Export';
import LightningInfo from '../../screens/Settings/Lightning/LightningInfo';
import LndLogs from '../../screens/Settings/Lightning/LndLogs';
import ManageSeedPhrase from '../../screens/Settings/ManageSeedPhrase';
import PinPad from '../../components/PinPad';
import Biometrics from '../../components/Biometrics';
import { useSelector } from 'react-redux';
import Store from '../../store/types';

const Stack = createNativeStackNavigator();

const navOptionHandler = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachPreviousScreen: false,
};

export type TInitialRoutes = 'Drawer' | 'StartPin' | 'Biometrics';
const RootNavigator = (): ReactElement => {
	const hasPin = useSelector((state: Store) => state.settings.pin);
	const hasBiometrics = useSelector(
		(state: Store) => state.settings.biometrics,
	);
	let initialRouteName: TInitialRoutes = 'Drawer';
	if (hasPin) {
		initialRouteName = 'StartPin';
	} else if (hasBiometrics) {
		initialRouteName = 'Biometrics';
	}
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
								if (hasBiometrics) {
									navigation.navigate('Biometrics');
								} else {
									navigation.replace('Drawer');
								}
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
					name="ExchangeRateSettings"
					component={ExchangeRateSettings}
					options={navOptionHandler}
				/>
				<Stack.Screen name="Biometrics" options={navOptionHandler}>
					{({ navigation }): ReactElement => (
						<Biometrics
							onSuccess={(): void => {
								navigation.replace('Drawer');
							}}
						/>
					)}
				</Stack.Screen>
				<Stack.Screen
					name="BackupSettings"
					component={BackupSettings}
					options={navOptionHandler}
				/>
				<Stack.Screen
					name="ExportBackups"
					component={ExportBackups}
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
