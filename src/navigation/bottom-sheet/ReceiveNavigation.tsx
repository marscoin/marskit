import React, { ReactElement, useMemo, memo } from 'react';
import { useSelector } from 'react-redux';
import {
	createNativeStackNavigator,
	NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import {
	useSafeAreaFrame,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';

import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import Receive from '../../screens/Wallets/Receive';
import ReceiveDetails from '../../screens/Wallets/Receive/ReceiveDetails';
import ReceiveNumberPad from '../../screens/Wallets/Receive/ReceiveNumberPad';
import Tags from '../../screens/Wallets/Receive/Tags';
import { NavigationContainer } from '../../styles/components';
import Store from '../../store/types';

const Stack = createNativeStackNavigator();
const navOptions: NativeStackNavigationOptions = {
	headerShown: false,
	gestureEnabled: true,
};

const ReceiveNavigation = (): ReactElement => {
	const insets = useSafeAreaInsets();
	const { height } = useSafeAreaFrame();
	const snapPoints = useMemo(
		() => [height - (60 + insets.top)],
		[height, insets.top],
	);
	const { isOpen, initial } =
		useSelector(
			(store: Store) => store.user.viewController?.receiveNavigation,
		) ?? {};

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

export default memo(ReceiveNavigation);
