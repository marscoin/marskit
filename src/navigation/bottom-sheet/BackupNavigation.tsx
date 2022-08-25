import React, { ReactElement, useMemo, memo } from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ShowMnemonic from '../../screens/Settings/Backup/ShowMnemonic';
import ConfirmMnemonic from '../../screens/Settings/Backup/ConfirmMnemonic';
import Result from '../../screens/Settings/Backup/Result';
import Metadata from '../../screens/Settings/Backup/Metadata';
import { NavigationContainer } from '../../styles/components';
import Store from '../../store/types';

const Stack = createNativeStackNavigator();
const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...TransitionPresets.SlideFromRightIOS,
	detachInactiveScreens: true,
};
const BackupNavigation = (): ReactElement => {
	const isOpen = useSelector(
		(store: Store) => store.user.viewController?.backupNavigation?.isOpen,
	);
	const snapPoints = useMemo(() => [600], []);

	return (
		<BottomSheetWrapper view="backupNavigation" snapPoints={snapPoints}>
			<NavigationContainer key={isOpen}>
				<Stack.Navigator screenOptions={navOptions}>
					<Stack.Group screenOptions={navOptions}>
						<Stack.Screen name="ShowMnemonic" component={ShowMnemonic} />
						<Stack.Screen name="ConfirmMnemonic" component={ConfirmMnemonic} />
						<Stack.Screen name="Result" component={Result} />
						<Stack.Screen name="Metadata" component={Metadata} />
					</Stack.Group>
				</Stack.Navigator>
			</NavigationContainer>
		</BottomSheetWrapper>
	);
};

export default memo(BackupNavigation);
