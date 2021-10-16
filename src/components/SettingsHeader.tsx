import React, { memo, ReactElement } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import {
	MaterialIcons,
	View,
	TouchableOpacity,
	Title,
	LeftArrow,
} from '../styles/components';
import colors from '../styles/colors';

const BackButton = ({
	onPress = (): null => null,
}: {
	onPress: Function;
}): ReactElement => {
	try {
		return (
			<TouchableOpacity
				color={'transparent'}
				onPress={onPress}
				style={styles.backIconContainer}>
				<LeftArrow />
			</TouchableOpacity>
		);
	} catch {
		return <View />;
	}
};

const SettingsHeader = ({
	title = '',
	showBackNavigation = true,
	showShadow = false,
}: {
	title: string;
	showBackNavigation?: boolean;
	showShadow: boolean;
}): ReactElement => {
	const navigation = useNavigation();
	const backgroundColor = 'onSurface';

	return (
		<>
			<View
				color={backgroundColor}
				style={showShadow ? containerShadowStyle : styles.container}>
				<View color={backgroundColor} style={styles.topRow}>
					<View style={styles.handle} />
				</View>
				<View color={backgroundColor} style={styles.bottomRow}>
					{showBackNavigation && <BackButton onPress={navigation.goBack} />}
					<View color={backgroundColor} style={styles.titleContainer}>
						<Title>{title}</Title>
					</View>
				</View>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		minHeight: 82,
		paddingHorizontal: 16,
		zIndex: 9999,
		display: 'flex',
		justifyContent: 'space-between',
	},
	containerShadow: {
		shadowColor: colors.black,
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.25,
		elevation: 5,
	},
	topRow: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 12,
	},
	bottomRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingBottom: 18,
	},
	handle: {
		height: 4,
		width: 32,
		borderRadius: 32,
		backgroundColor: '#3B3B3B',
	},
	backIconContainer: { marginRight: 18 },
	backIcon: {},
	titleContainer: {},
});

const containerShadowStyle = StyleSheet.flatten([
	styles.container,
	styles.containerShadow,
]);

export default memo(SettingsHeader);
