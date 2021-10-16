import React, { ReactElement } from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LndLogs from '../../screens/Settings/Lightning/LndLogs';
import SettingsMenu from '../../screens/Settings';
import ManageSeedPhrase from '../../screens/Settings/ManageSeedPhrase';
import CurrenciesSettings from '../../screens/Settings/Currencies';
import ElectrumConfig from '../../screens/Settings/ElectrumConfig';
import CoinSelectPreference from '../../screens/Settings/CoinSelectPreference';
import AddressTypePreference from '../../screens/Settings/AddressTypePreference';
import BackupSettings from '../../screens/Settings/Backup';
import ExportBackups from '../../screens/Settings/Backup/Export';
import LightningChannels from '../../screens/Settings/Lightning/LightningChannels';
import LightningChannelDetails from '../../screens/Settings/Lightning/LightningChannelDetails';
import LightningNodeInfo from '../../screens/Settings/Lightning/LightningNodeInfo';
import TempSettings from '../../screens/Settings/TempSettings';
import PinPad from '../../components/PinPad';
import BitcoinSettings from '../../screens/Settings/Currencies/Bitcoin';

const Stack = createNativeStackNavigator();

const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachInactiveScreens: true,
};

const SettingsNavigator = (): ReactElement => {
	return (
		<Stack.Navigator
			screenOptions={navOptions}
			initialRouteName={'SettingsMenu'}>
			<Stack.Group screenOptions={navOptions}>
				<Stack.Screen name="SettingsMenu" component={SettingsMenu} />
				<Stack.Screen
					name="CurrenciesSettings"
					component={CurrenciesSettings}
				/>
				<Stack.Screen name="BitcoinSettings" component={BitcoinSettings} />
				<Stack.Screen name="ElectrumConfig" component={ElectrumConfig} />
				<Stack.Screen name="TempSettings" component={TempSettings} />

				<Stack.Screen
					name="CoinSelectPreference"
					component={CoinSelectPreference}
				/>
				<Stack.Screen
					name="AddressTypePreference"
					component={AddressTypePreference}
				/>
				<Stack.Screen name="BackupSettings" component={BackupSettings} />
				<Stack.Screen name="ExportBackups" component={ExportBackups} />
				<Stack.Screen name="LightningChannels" component={LightningChannels} />
				<Stack.Screen
					name="LightningChannelDetails"
					component={LightningChannelDetails}
				/>
				<Stack.Screen name="LightningNodeInfo" component={LightningNodeInfo} />
				<Stack.Screen name="ManageSeedPhrase" component={ManageSeedPhrase} />
				<Stack.Screen name="LndLogs" component={LndLogs} />
				<Stack.Screen name="Pin" component={PinPad} />
			</Stack.Group>
		</Stack.Navigator>
	);
};

export default SettingsNavigator;
