import React, { ReactElement, useMemo } from 'react';
import { createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TransitionPresets } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import AddressAndAmount from '../../screens/Wallets/SendOnChainTransaction2/AddressAndAmount';
import FeeRate from '../../screens/Wallets/SendOnChainTransaction2/FeeRate';
import Tags from '../../screens/Wallets/SendOnChainTransaction2/Tags';
import ReviewAndSend from '../../screens/Wallets/SendOnChainTransaction2/ReviewAndSend';
import SendAssetPickerList from '../../screens/Wallets/SendOnChainTransaction2/SendAssetPickerList';
import Result from '../../screens/Wallets/SendOnChainTransaction2/Result';
import { NavigationContainer } from '../../styles/components';
import {
	resetOnChainTransaction,
	setupOnChainTransaction,
} from '../../store/actions/wallet';
import Store from '../../store/types';

const navigationRef = createNavigationContainerRef();
const Stack = createNativeStackNavigator();
const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachInactiveScreens: true,
};

const SendNavigation = (): ReactElement => {
	const { isOpen, initial } = useSelector(
		(store: Store) => store.user.viewController?.SendNavigation,
	);
	const snapPoints = useMemo(() => [600], []);

	const initialRouteName = !isOpen ? undefined : initial;

	return (
		<BottomSheetWrapper
			view="sendNavigation"
			onClose={resetOnChainTransaction}
			onOpen={setupOnChainTransaction}
			snapPoints={snapPoints}>
			<NavigationContainer key={initialRouteName} ref={navigationRef}>
				<Stack.Navigator
					screenOptions={navOptions}
					initialRouteName={initialRouteName}>
					<Stack.Group screenOptions={navOptions}>
						<Stack.Screen
							name="SendAssetPickerList"
							component={SendAssetPickerList}
						/>
						<Stack.Screen
							name="AddressAndAmount"
							component={AddressAndAmount}
						/>
						<Stack.Screen name="FeeRate" component={FeeRate} />
						<Stack.Screen name="Tags" component={Tags} />
						<Stack.Screen name="ReviewAndSend" component={ReviewAndSend} />
						<Stack.Screen name="Result" component={Result} />
					</Stack.Group>
				</Stack.Navigator>
			</NavigationContainer>
		</BottomSheetWrapper>
	);
};

export default SendNavigation;
