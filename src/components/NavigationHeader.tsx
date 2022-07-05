import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

import {
	Subtitle,
	TitleHaas,
	TouchableOpacity,
	View,
	BackIcon,
	XIcon,
} from '../styles/components';

const BackButton = memo(
	({ onPress = (): null => null }: { onPress: Function }): ReactElement => {
		try {
			return (
				<TouchableOpacity onPress={onPress} style={styles.iconContainer}>
					<BackIcon width={20} height={20} />
				</TouchableOpacity>
			);
		} catch {
			return <View />;
		}
	},
);

const CloseButton = memo(
	({ onPress = (): null => null }: { onPress: Function }): ReactElement => {
		try {
			return (
				<TouchableOpacity onPress={onPress} style={styles.iconContainer}>
					<XIcon width={24} height={24} />
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
	size = 'lg',
	handleClosePress,
}: {
	title?: string;
	displayBackButton?: boolean;
	onBackPress?: Function;
	navigateBack?: boolean;
	size?: 'lg' | 'sm';
	handleClosePress?: Function;
}): ReactElement => {
	const navigation = useNavigation<any>();

	const handleBackPress = useCallback(() => {
		onBackPress();
		if (navigateBack) {
			navigation.goBack();
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const Text = useMemo(() => (size === 'lg' ? TitleHaas : Subtitle), [size]);

	return (
		<View style={styles.container}>
			<View style={styles.leftColumn}>
				{displayBackButton && <BackButton onPress={handleBackPress} />}
			</View>
			<View style={styles.middleColumn}>
				<Text style={styles.title}>{title}</Text>
			</View>
			<View style={styles.rightColumn}>
				{handleClosePress && <CloseButton onPress={handleClosePress} />}
			</View>
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
		width: 50,
		justifyContent: 'center',
		backgroundColor: 'transparent',
		left: 15,
	},
	middleColumn: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	rightColumn: {
		width: 50,
		justifyContent: 'center',
		alignItems: 'flex-end',
		backgroundColor: 'transparent',
		right: 15,
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
