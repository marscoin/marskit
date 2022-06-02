import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
	View,
	TouchableOpacity,
	TitleHaas,
	Subtitle,
} from '../styles/components';
import { SvgXml } from 'react-native-svg';
import { backIcon } from '../assets/icons/wallet';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Store from '../store/types';
import { TViewController } from '../store/types/user';

const _backIcon = backIcon();

const BackButton = memo(
	({ onPress = (): null => null }: { onPress: Function }): ReactElement => {
		try {
			return (
				<TouchableOpacity onPress={onPress} style={styles.iconContainer}>
					<SvgXml xml={_backIcon} width={20} height={20} />
				</TouchableOpacity>
			);
		} catch {
			return <View />;
		}
	},
);

const NavigationHeader = ({
	title = ' ',
	displayBackButton = true,
	onBackPress = (): null => null,
	navigateBack = true,
	view = '',
	size = 'lg',
}: {
	title?: string;
	displayBackButton?: boolean;
	onBackPress?: Function;
	navigateBack?: boolean;
	view?: TViewController | string;
	size?: 'lg' | 'sm';
}): ReactElement => {
	const navigation = useNavigation<any>();
	const routes = useNavigationState((state) => state?.routes);

	const handleBackPress = useCallback(() => {
		onBackPress();
		if (navigateBack) {
			navigation.goBack();
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const sendIsOpen = useSelector(
		(store: Store) => store.user.viewController?.send?.isOpen,
	);

	const receiveIsOpen = useSelector(
		(store: Store) => store.user.viewController?.receive?.isOpen,
	);

	const _displayBackButton = useMemo(() => {
		/*
		 * Ensure the back button is not rendered for the send and receive views.
		 * Otherwise, the navigation.goBack() function will fallback to and affect the parent view.
		 */
		if (sendIsOpen && view === 'send') {
			return false;
		}
		if (receiveIsOpen && view === 'receive') {
			return false;
		}
		return routes?.length > 1 && displayBackButton;
	}, [sendIsOpen, view, receiveIsOpen, routes?.length, displayBackButton]);

	const Text = useMemo(() => (size === 'lg' ? TitleHaas : Subtitle), [size]);

	return (
		<View style={styles.container}>
			<View style={styles.leftColumn}>
				{_displayBackButton && <BackButton onPress={handleBackPress} />}
			</View>
			<View style={styles.middleColumn}>
				<Text style={styles.title}>{title}</Text>
			</View>
			<View style={styles.rightColumn} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		marginTop: 17,
		marginBottom: 20,
		backgroundColor: 'transparent',
	},
	leftColumn: {
		flex: 1,
		justifyContent: 'center',
		backgroundColor: 'transparent',
		left: 15,
	},
	middleColumn: {
		flex: 1.5,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	rightColumn: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-end',
		backgroundColor: 'transparent',
	},
	title: {
		textAlign: 'center',
	},
	iconContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
});

export default memo(NavigationHeader);
