import React, { memo, ReactElement } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import {
	View,
	TouchableOpacity,
	Subtitle,
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
					<View color={backgroundColor} style={styles.titleContainer}>
						{showBackNavigation && <BackButton onPress={navigation.goBack} />}
						<Subtitle style={showBackNavigation ? styles.titleCentered : {}}>
							{title}
						</Subtitle>
					</View>
				</View>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 82,
		paddingHorizontal: 16,
		zIndex: 98,
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
	},
	handle: {
		height: 4,
		width: 32,
		borderRadius: 32,
		backgroundColor: '#3B3B3B',
	},
	backIconContainer: {
		marginRight: 18,
		position: 'absolute',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		zIndex: 99,
	},
	titleContainer: {
		flex: 1,
		paddingBottom: 18,
	},
	titleCentered: {
		textAlign: 'center',
	},
});

const containerShadowStyle = StyleSheet.flatten([
	styles.container,
	styles.containerShadow,
]);

export default memo(SettingsHeader);
