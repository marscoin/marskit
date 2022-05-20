import React, { memo, ReactElement, useMemo } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
	View as ThemedView,
	Subtitle,
	Text01S,
} from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';
import Button from '../../../components/Button';
import Glow from '../../../components/Glow';
import { toggleView } from '../../../store/actions/user';

const Result = ({ navigation, route }): ReactElement => {
	const { success = true, errorTitle, errorMessage } = route.params;
	const insets = useSafeAreaInsets();
	const nextButtonContainer = useMemo(
		() => ({
			...styles.nextButtonContainer,
			paddingBottom: insets.bottom + 10,
		}),
		[insets.bottom],
	);

	const source = success
		? require('../../../assets/illustrations/check.png')
		: require('../../../assets/illustrations/cross.png');

	const handleButtonPress = (): void => {
		if (success) {
			toggleView({
				view: 'SendNavigation',
				data: {
					isOpen: false,
				},
			});
		} else {
			navigation.navigate('ReviewAndSend');
		}
	};

	return (
		<ThemedView color="onSurface" style={styles.container}>
			{success ? (
				<Subtitle>Bitcoin sent</Subtitle>
			) : (
				<NavigationHeader title="Transaction failed" size="sm" />
			)}

			<View style={styles.error}>
				{errorTitle && (
					<Subtitle style={styles.errorTitle} color="red">
						{errorTitle}
					</Subtitle>
				)}
				{errorMessage && <Text01S color="red">{errorMessage}</Text01S>}
			</View>

			<View style={styles.imageContainer}>
				<Glow
					style={styles.glow}
					size={300}
					color={success ? 'green' : 'red'}
				/>
				<Image source={source} style={styles.image} />
			</View>

			<View style={nextButtonContainer}>
				<Button
					size="lg"
					text={success ? 'Close' : 'Try again'}
					onPress={handleButtonPress}
				/>
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
	error: {
		marginHorizontal: 32,
	},
	errorTitle: {
		marginBottom: 8,
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
		paddingHorizontal: 16,
		minHeight: 100,
	},
});

export default memo(Result);
