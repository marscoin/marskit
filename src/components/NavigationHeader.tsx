import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { View, TouchableOpacity, Text01M } from '../styles/components';
import { SvgXml } from 'react-native-svg';
import { backIcon } from '../assets/icons/wallet';
import { useNavigationState } from '@react-navigation/native';

const _backIcon = backIcon();

const BackButton = memo(
	({ onPress = (): null => null }: { onPress: Function }): ReactElement => {
		try {
			return (
				<TouchableOpacity onPress={onPress} style={styles.iconContainer}>
					<SvgXml xml={_backIcon} width={28} height={22} />
				</TouchableOpacity>
			);
		} catch {
			return <View />;
		}
	},
);

const NavigationHeader = ({
	title = '',
	displayBackButton = true,
	onBackPress = (): null => null,
	navigateBack = true,
}: {
	title?: string;
	displayBackButton?: boolean;
	onBackPress?: Function;
	navigateBack?: boolean;
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

	const _displayBackButton = useMemo(() => {
		return routes?.length > 1 && displayBackButton;
	}, [displayBackButton, routes?.length]);

	return (
		<View style={styles.container}>
			<View style={styles.leftColumn}>
				{_displayBackButton && <BackButton onPress={handleBackPress} />}
			</View>
			<View style={styles.middleColumn}>
				<Text01M style={styles.title}>{title}</Text01M>
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
