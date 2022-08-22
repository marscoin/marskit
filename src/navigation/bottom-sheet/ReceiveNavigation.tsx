import React, { ReactElement, useMemo } from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import Receive from '../../screens/Wallets/Receive';
import ReceiveDetails from '../../screens/Wallets/Receive/ReceiveDetails';
import ReceiveNumberPad from '../../screens/Wallets/Receive/ReceiveNumberPad';
import Tags from '../../screens/Wallets/Receive/Tags';
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
	const snapPoints = useMemo(() => ['87%'], []);

	const initialRouteName = !isOpen ? undefined : initial;

	return (
		<BottomSheetWrapper view="receiveNavigation" snapPoints={snapPoints}>
			<NavigationContainer key={initialRouteName}>
				<Stack.Navigator
					screenOptions={navOptions}
					initialRouteName={initialRouteName}>
					<Stack.Group screenOptions={navOptions}>
						<Stack.Screen name="Receive" component={Receive} />
						<Stack.Screen name="ReceiveDetails" component={ReceiveDetails} />
						<Stack.Screen name="Tags" component={Tags} />
					</Stack.Group>
				</Stack.Navigator>

				<ReceiveNumberPad />
			</NavigationContainer>
		</BottomSheetWrapper>
	);
};

export default ReceiveNavigation;
