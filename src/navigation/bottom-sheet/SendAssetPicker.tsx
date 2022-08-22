import React, { ReactElement } from 'react';
import {
	createNativeStackNavigator,
	NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { TransitionPresets } from '@react-navigation/stack';
import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import Send from '../../screens/Wallets/Send';
import SendAssetPickerList from '../../screens/Wallets/Send/SendAssetPickerList';
import { NavigationContainer } from '../../styles/components';

export type SendAssetPickerNavigationProp =
	NativeStackNavigationProp<SendAssetPickerStackParamList>;

export type SendAssetPickerStackParamList = {
	sendAssetPickerList: undefined;
	send: undefined;
};

const Stack = createNativeStackNavigator<SendAssetPickerStackParamList>();
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
					</Stack.Group>
				</Stack.Navigator>
			</NavigationContainer>
		</BottomSheetWrapper>
	);
};

export default SendAssetPicker;
