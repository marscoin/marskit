import React, { ReactElement } from 'react';
import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TransitionPresets } from '@react-navigation/stack';
import Send from '../../screens/Wallets/Send';
import Receive from '../../screens/Wallets/Receive';
import SendAssetPickerList from '../../screens/Wallets/Send/SendAssetPickerList';
import { NavigationContainer } from '../../styles/components';

const Stack = createNativeStackNavigator();
const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachInactiveScreens: true,
};
const SendAssetPicker = (): ReactElement => {
	return (
		<BottomSheetWrapper view="sendAssetPicker">
			<NavigationContainer>
				<Stack.Navigator
					screenOptions={navOptions}
					initialRouteName={'sendAssetPickerList'}>
					<Stack.Group screenOptions={navOptions}>
						<Stack.Screen
							name="sendAssetPickerList"
							component={SendAssetPickerList}
						/>
						<Stack.Screen name="send" component={Send} />
						<Stack.Screen name="receive" component={Receive} />
					</Stack.Group>
				</Stack.Navigator>
			</NavigationContainer>
		</BottomSheetWrapper>
	);
};

export default SendAssetPicker;
