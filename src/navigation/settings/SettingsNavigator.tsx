import React, { ReactElement } from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsMenu from '../../screens/Settings';
import ManageSeedPhrase from '../../screens/Settings/ManageSeedPhrase';
import CurrenciesSettings from '../../screens/Settings/Currencies';
import ElectrumConfig from '../../screens/Settings/ElectrumConfig';
import CoinSelectPreference from '../../screens/Settings/CoinSelectPreference';
import AddressTypePreference from '../../screens/Settings/AddressTypePreference';
import DevSettings from '../../screens/Settings/DevSettings';
import ExportBackups from '../../screens/Settings/Backup/Export';
import TempSettings from '../../screens/Settings/TempSettings';
import BitcoinUnitSettings from '../../screens/Settings/BitcoinUnit';
import TransactionSpeedSettings from '../../screens/Settings/TransactionSpeed';
import AuthCheck from '../../components/AuthCheck';
import GeneralSettings from '../../screens/Settings/General';
import SecuritySettings from '../../screens/Settings/Security';
import BackupMenu from '../../screens/Settings/BackupMenu';
import NetworksSettings from '../../screens/Settings/Networks';
import AdvancedSettings from '../../screens/Settings/Advanced';
import AboutSettings from '../../screens/Settings/About';
import EasterEgg from '../../screens/Settings/EasterEgg';
import BitcoinNetworkSelection from '../../screens/Settings/Bitcoin/BitcoinNetworkSelection';
import Connections from '../../screens/Settings/Lightning/Connections';
import ConnectionDetails from '../../screens/Settings/Lightning/ConnectionDetails';
import CloseConnection from '../../screens/Settings/Lightning/CloseConnection';
import AddConnection from '../../screens/Settings/Lightning/AddConnection';
import AddConnectionResult from '../../screens/Settings/Lightning/AddConnectionResult';

const Stack = createNativeStackNavigator();

const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachInactiveScreens: true,
};

const SettingsNavigator = (): ReactElement => {
	return (
		<Stack.Navigator screenOptions={navOptions} initialRouteName="SettingsMenu">
			<Stack.Group screenOptions={navOptions}>
				<Stack.Screen name="SettingsMenu" component={SettingsMenu} />

				<Stack.Screen name="GeneralSettings" component={GeneralSettings} />
				<Stack.Screen name="SecuritySettings" component={SecuritySettings} />
				<Stack.Screen name="BackupMenu" component={BackupMenu} />
				<Stack.Screen name="NetworksSettings" component={NetworksSettings} />
				<Stack.Screen name="AdvancedSettings" component={AdvancedSettings} />
				<Stack.Screen name="AboutSettings" component={AboutSettings} />
				<Stack.Screen name="EasterEgg" component={EasterEgg} />

				<Stack.Screen
					name="CurrenciesSettings"
					component={CurrenciesSettings}
				/>
				<Stack.Screen
					name="BitcoinUnitSettings"
					component={BitcoinUnitSettings}
				/>
				<Stack.Screen
					name="TransactionSpeedSettings"
					component={TransactionSpeedSettings}
				/>
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
				<Stack.Screen name="DevSettings" component={DevSettings} />
				<Stack.Screen name="ExportBackups" component={ExportBackups} />
				<Stack.Screen
					name="BitcoinNetworkSelection"
					component={BitcoinNetworkSelection}
				/>
				<Stack.Screen name="ManageSeedPhrase" component={ManageSeedPhrase} />
				<Stack.Screen name="AuthCheck" component={AuthCheck} />
				<Stack.Screen name="LightningConnections" component={Connections} />
				<Stack.Screen
					name="LightningConnection"
					component={ConnectionDetails}
				/>
				<Stack.Screen
					name="LightningCloseConnection"
					component={CloseConnection}
				/>
				<Stack.Screen name="LightningAddConnection" component={AddConnection} />
				<Stack.Screen
					name="LightningAddConnectionResult"
					component={AddConnectionResult}
				/>
			</Stack.Group>
		</Stack.Navigator>
	);
};

export default SettingsNavigator;
