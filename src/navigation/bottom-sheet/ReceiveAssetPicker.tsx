import React, { ReactElement } from 'react';
import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TransitionPresets } from '@react-navigation/stack';
import Receive from '../../screens/Wallets/Receive';
import ReceiveAssetPickerList from '../../screens/Wallets/Receive/ReceiveAssetPickerList';
import { NavigationContainer } from '../../styles/components';

const Stack = createNativeStackNavigator();
const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachInactiveScreens: true,
};
const ReceiveAssetPicker = (): ReactElement => {
	return (
		<BottomSheetWrapper view="receiveAssetPicker">
			<NavigationContainer>
				<Stack.Navigator
					screenOptions={navOptions}
					initialRouteName={'receiveAssetPickerList'}>
					<Stack.Group screenOptions={navOptions}>
						<Stack.Screen
							name="receiveAssetPickerList"
							component={ReceiveAssetPickerList}
						/>
						<Stack.Screen name="receive" component={Receive} />
					</Stack.Group>
				</Stack.Navigator>
			</NavigationContainer>
		</BottomSheetWrapper>
	);
};

export default ReceiveAssetPicker;
