import React, { ReactElement, useMemo } from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Receive from '../../screens/Wallets/Receive';
import ReceiveAssetPickerList from '../../screens/Wallets/Receive/ReceiveAssetPickerList';
import { NavigationContainer } from '../../styles/components';
import Store from '../../store/types';

const Stack = createNativeStackNavigator();
const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachInactiveScreens: true,
};
const ReceiveNavigation = (): ReactElement => {
	const { isOpen, initial } =
		useSelector(
			(store: Store) => store.user.viewController?.receiveNavigation,
		) ?? {};
	const snapPoints = useMemo(() => [600], []);

	const initialRouteName = !isOpen ? undefined : initial;

	return (
		<BottomSheetWrapper view="receiveNavigation" snapPoints={snapPoints}>
			<NavigationContainer key={initialRouteName}>
				<Stack.Navigator
					screenOptions={navOptions}
					initialRouteName={initialRouteName}>
					<Stack.Group screenOptions={navOptions}>
						<Stack.Screen
							name="ReceiveAssetPickerList"
							component={ReceiveAssetPickerList}
						/>
						<Stack.Screen name="Receive" component={Receive} />
					</Stack.Group>
				</Stack.Navigator>
			</NavigationContainer>
		</BottomSheetWrapper>
	);
};

export default ReceiveNavigation;
