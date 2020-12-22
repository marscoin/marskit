import React, { memo, ReactElement, useState } from 'react';
import { StyleSheet } from 'react-native';
import { EvilIcon, Text, View } from '../styles/components';
import { RNCamera } from 'react-native-camera';
import { systemWeights } from 'react-native-typography';

const _Camera = ({
	onBarCodeRead = (): null => null,
	onClose = (): null => null,
}: {
	onBarCodeRead: Function;
	onClose: Function;
}): ReactElement => {
	const [_data, setData] = useState('');
	const notAuthorizedView = (
		<View style={styles.notAuthorizedView}>
			<EvilIcon name={'exclamation'} size={60} />
			<Text style={styles.boldText}>
				It appears Spectrum does not have permission to access your camera.
			</Text>
			<Text style={styles.text}>
				To utilize this feature in the future you will need to enable camera
				permissions for this app from your phones settings.
			</Text>
		</View>
	);

	return (
		<View style={styles.container}>
			<RNCamera
				captureAudio={false}
				style={styles.container}
				onBarCodeRead={({ data }): void => {
					if (_data !== data) {
						setData(data);
						onBarCodeRead(data);
					}
				}}
				onMountError={(): void => {
					console.log(
						'An error was encountered when loading the camera. Please ensure Spectrum has permission to use this feature in your phone settings.',
					);
					onClose();
				}}
				notAuthorizedView={notAuthorizedView}
				type={RNCamera.Constants.Type.back}
				flashMode={RNCamera.Constants.FlashMode.on}
				androidCameraPermissionOptions={{
					title: 'Permission to use camera',
					message: 'Spectrum needs permission to use your camera',
					buttonPositive: 'Okay',
					buttonNegative: 'Cancel',
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'transparent',
		position: 'absolute',
		height: '100%',
		width: '100%',
		zIndex: 1000,
	},
	notAuthorizedView: {
		flex: 1,
		top: -40,
		backgroundColor: 'transparent',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	text: {
		...systemWeights.regular,
		fontSize: 18,
		textAlign: 'center',
	},
	boldText: {
		...systemWeights.bold,
		fontSize: 18,
		textAlign: 'center',
		marginVertical: 10,
	},
});

const Camera = memo(_Camera, () => true);

export default Camera;
