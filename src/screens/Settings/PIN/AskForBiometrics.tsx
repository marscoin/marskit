import React, { memo, ReactElement, useState, useEffect, useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
	FaceIdIcon,
	Switch,
	Text01M,
	Text01S,
	TouchIdIcon,
	View as ThemedView,
} from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';
import Button from '../../../components/Button';
import Glow from '../../../components/Glow';
import { toggleBiometrics } from '../../../utils/settings';
import { IsSensorAvailableResult } from '../../../components/Biometrics';

const rnBiometrics = new ReactNativeBiometrics();

const ChoosePIN = ({ navigation }): ReactElement => {
	const insets = useSafeAreaInsets();
	const [enabled, setEnabled] = useState<boolean>(false);
	const [biometryData, setBiometricData] = useState<
		IsSensorAvailableResult | undefined
	>();
	const nextButtonContainer = useMemo(
		() => ({
			...styles.nextButtonContainer,
			paddingBottom: insets.bottom + 10,
		}),
		[insets.bottom],
	);

	useEffect(() => {
		rnBiometrics.isSensorAvailable().then((data) => setBiometricData(data));
	}, []);

	const buttonText = biometryData?.available === false ? 'Skip' : 'Continue';

	const handleOnBack = (): void => {
		navigation.goBack();
	};

	const handleButtonPress = (): void => {
		if (biometryData?.available === false || !enabled) {
			navigation.navigate('Result', { bio: false });
			return;
		}

		rnBiometrics
			.simplePrompt({ promptMessage: 'Bitkit' })
			.then(({ success }) => {
				if (!success) {
					return Alert.alert('Biometrics failed');
				}
				toggleBiometrics(true);
				navigation.navigate('Result', { bio: true });
			})
			.catch(() => {
				Alert.alert('Biometrics failed');
			});
	};

	const typeName =
		biometryData?.biometryType === 'TouchID'
			? 'Touch ID'
			: biometryData?.biometryType === 'FaceID'
			? 'Face ID'
			: biometryData?.biometryType ?? '';

	return (
		<ThemedView color="onSurface" style={styles.container}>
			<NavigationHeader title={typeName} size="sm" onBackPress={handleOnBack} />

			<View style={styles.message}>
				{!biometryData && <Text01S color="gray1">Loading...</Text01S>}

				{biometryData?.available === false && (
					<Text01S color="gray1">
						It appears that your device does not support Biometric security.
					</Text01S>
				)}

				{biometryData?.biometryType && (
					<Text01S color="gray1">
						PIN code set. Would you like to use {typeName} instead of your PIN
						code?
					</Text01S>
				)}
			</View>

			{biometryData?.biometryType && (
				<View style={styles.imageContainer}>
					<Glow style={styles.glow} size={600} color="brand" />
					{biometryData?.biometryType === 'FaceID' ? (
						<FaceIdIcon />
					) : (
						<TouchIdIcon />
					)}
				</View>
			)}

			<View style={nextButtonContainer}>
				{biometryData?.biometryType && (
					<View style={styles.switchContainer}>
						<Text01M>Use {typeName}</Text01M>
						<Switch
							onValueChange={(): void => setEnabled((e) => !e)}
							value={enabled}
						/>
					</View>
				)}
				<Button
					size="lg"
					text={buttonText}
					onPress={handleButtonPress}
					disabled={!biometryData}
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
	message: {
		marginTop: 10,
		marginHorizontal: 32,
	},
	imageContainer: {
		marginHorizontal: 32,
		position: 'relative',
		height: 280,
		width: 280,
		justifyContent: 'center',
		alignItems: 'center',
	},
	glow: {
		position: 'absolute',
	},
	switchContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alighItems: 'center',
		marginBottom: 32,
	},
	nextButtonContainer: {
		paddingHorizontal: 32,
		width: '100%',
		minHeight: 100,
	},
});

export default memo(ChoosePIN);
