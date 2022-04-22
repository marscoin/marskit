import React, { ReactElement, useCallback, useMemo } from 'react';
import { Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TransitionPresets } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import WalletsScreen from '../../screens/Wallets';
import Store from '../../store/types';
import themes from '../../styles/themes';
import QR from '../../components/QR';
import BitcoinToLightningModal from '../../screens/Wallets/SendOnChainTransaction/BitcoinToLightningModal';
import { CameraIcon, Text02M, View } from '../../styles/components';
import AuthCheck from '../../components/AuthCheck';
import { receiveIcon, sendIcon } from '../../assets/icons/tabs';
import { toggleView } from '../../store/actions/user';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const transitionPreset =
	Platform.OS === 'ios'
		? TransitionPresets.SlideFromRightIOS
		: TransitionPresets.DefaultTransition;

const navOptions = {
	headerShown: false,
	gestureEnabled: true,
	...transitionPreset,
	detachInactiveScreens: true,
};

const screenOptions = {
	...navOptions,
};

const modalOptions = {
	...navOptions,
	...TransitionPresets.ModalSlideFromBottomIOS,
};

// BlurView + bottomtabsnavigation doesn't work on android
// so we use regular View for it https://github.com/software-mansion/react-native-screens/issues/1287
const BlurAndroid = ({ children, style }): ReactElement => {
	const settings = useSelector((state: Store) => state.settings);
	const theme = useMemo(() => themes[settings.theme], [settings.theme]);
	const { tabBackground } = theme.colors;
	const s = useMemo(
		() => ({ ...style, backgroundColor: tabBackground }),
		[style, tabBackground],
	);

	return <View style={s}>{children}</View>;
};
const Blur = Platform.OS === 'ios' ? BlurView : BlurAndroid;

const WalletsStack = (): ReactElement => {
	return (
		<Stack.Navigator initialRouteName="Wallets" screenOptions={navOptions}>
			<Stack.Screen
				name="Wallets"
				component={WalletsScreen}
				options={screenOptions}
			/>
			<Stack.Group screenOptions={modalOptions}>
				<Stack.Screen
					name="BitcoinToLightning"
					component={BitcoinToLightningModal}
				/>
				<Stack.Screen name="QR" component={QR} />
				<Stack.Screen name="AuthCheck" component={AuthCheck} />
			</Stack.Group>
		</Stack.Navigator>
	);
};

export const TabBar = ({ navigation }): ReactElement => {
	const settings = useSelector((state: Store) => state.settings);
	const theme = useMemo(() => themes[settings.theme], [settings.theme]);
	const { white08 } = theme.colors;
	const insets = useSafeAreaInsets();

	const onReceivePress = (): void => {
		toggleView({
			view: 'receiveAssetPicker',
			data: {
				id: 'receive',
				isOpen: true,
				snapPoint: 1,
			},
		});
	};
	const onSendPress = (): void => {
		toggleView({
			view: 'sendAssetPicker',
			data: {
				id: 'send',
				isOpen: true,
				snapPoint: 1,
			},
		});
	};
	const openScanner = useCallback(
		() => navigation.navigate('Scanner'),
		[navigation],
	);

	return (
		<View style={[styles.tabRoot, { bottom: Math.max(insets.bottom, 18) }]}>
			<TouchableOpacity onPress={onSendPress} style={styles.blurContainer}>
				<Blur style={styles.tabSend}>
					<SvgXml xml={sendIcon('white')} width={15} height={15} />
					<Text02M style={styles.tabText}>Send</Text02M>
				</Blur>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={openScanner}
				activeOpacity={0.8}
				style={[styles.tabScan, { borderColor: white08 }]}>
				<CameraIcon width={32} height={32} />
			</TouchableOpacity>
			<TouchableOpacity onPress={onReceivePress} style={styles.blurContainer}>
				<Blur style={styles.tabRecieve}>
					<SvgXml xml={receiveIcon('white')} width={15} height={15} />
					<Text02M style={styles.tabText}>Recieve</Text02M>
				</Blur>
			</TouchableOpacity>
		</View>
	);
};

const TabNavigator = (): ReactElement => {
	const tabScreenOptions = useMemo(
		() => ({
			tabBarHideOnKeyboard: true,
			headerShown: false,
		}),
		[],
	);

	return (
		<Tab.Navigator tabBar={(props): ReactElement => <TabBar {...props} />}>
			<Tab.Group screenOptions={tabScreenOptions}>
				<Tab.Screen name="WalletsStack" component={WalletsStack} />
			</Tab.Group>
		</Tab.Navigator>
	);
};

const styles = StyleSheet.create({
	tabRoot: {
		left: 10,
		right: 10,
		height: 80,
		position: 'absolute',
		backgroundColor: 'transparent',
		flexDirection: 'row',
		alignItems: 'center',
	},
	blurContainer: {
		height: 56,
		flex: 1,
	},
	tabSend: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		paddingRight: 30,
		borderRadius: 30,
	},
	tabRecieve: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		paddingLeft: 30,
		borderRadius: 30,
	},
	tabScan: {
		height: 80,
		width: 80,
		borderRadius: 40,
		backgroundColor: '#101010',
		marginHorizontal: -40,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1,
		borderWidth: 2,
	},
	tabText: {
		marginLeft: 10,
	},
});

export default TabNavigator;
