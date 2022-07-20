import React, { memo, ReactElement, useMemo } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View as ThemedView, Text01S } from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';
import Button from '../../../components/Button';
import Glow from '../../../components/Glow';
import { toggleView } from '../../../store/actions/user';

const Result = ({ route }): ReactElement => {
	const { bio } = route?.params;
	const insets = useSafeAreaInsets();
	const nextButtonContainer = useMemo(
		() => ({
			...styles.nextButtonContainer,
			paddingBottom: insets.bottom + 10,
		}),
		[insets.bottom],
	);

	const source = require('../../../assets/illustrations/check.png');

	const handleButtonPress = (): void => {
		toggleView({
			view: 'PINNavigation',
			data: { isOpen: false },
		});
	};
	return (
		<ThemedView color="onSurface" style={styles.container}>
			<NavigationHeader
				title="PIN setup complete"
				size="sm"
				displayBackButton={false}
			/>

			<View style={styles.message}>
				{bio ? (
					<Text01S color="gray1">
						You have successfully set up a PIN code and biometrics to improve
						your security.
					</Text01S>
				) : (
					<Text01S color="gray1">
						You have successfully set up a PIN code to improve your security.
					</Text01S>
				)}
			</View>

			<View style={styles.imageContainer}>
				<Glow style={styles.glow} size={600} color="green" />
				<Image source={source} style={styles.image} />
			</View>

			<View style={nextButtonContainer}>
				<Button size="lg" text="OK" onPress={handleButtonPress} />
			</View>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	message: {
		marginHorizontal: 32,
		alignSelf: 'flex-start',
	},
	imageContainer: {
		position: 'relative',
		height: 300,
		width: 300,
		justifyContent: 'center',
		alignItems: 'center',
	},
	image: {
		width: 200,
		height: 200,
	},
	glow: {
		position: 'absolute',
	},
	nextButtonContainer: {
		width: '100%',
		paddingHorizontal: 32,
		minHeight: 100,
	},
});

export default memo(Result);
