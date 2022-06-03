import React, { memo, ReactElement, useMemo } from 'react';
import { StyleSheet, Image, View } from 'react-native';

import { Subtitle, Text01S } from '../../../styles/components';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import Glow from '../../../components/Glow';
import Button from '../../../components/Button';
import { toggleView } from '../../../store/actions/user';

const PINPrompt = (): ReactElement => {
	const snapPoints = useMemo(() => [450], []);

	const handlePIN = (): void => {
		toggleView({
			view: 'PINPrompt',
			data: { isOpen: false },
		});
		toggleView({
			view: 'PINNavigation',
			data: { isOpen: true },
		});
	};

	const handleLater = (): void => {
		toggleView({
			view: 'PINPrompt',
			data: { isOpen: false },
		});
	};

	return (
		<BottomSheetWrapper
			snapPoints={snapPoints}
			headerColor="background"
			backdrop={true}
			onClose={handleLater}
			view="PINPrompt">
			<View style={styles.root}>
				<Subtitle style={styles.title}>Set up a PIN code</Subtitle>
				<Text01S color="white5">
					To increase security, you can set up a PIN code. You will have to
					enter this PIN code to send a transaction.
				</Text01S>
				<View style={styles.imageContainer}>
					<Glow color="green" size={500} style={styles.glow} />
					<Image
						style={styles.image}
						resizeMode="contain"
						source={require('../../../assets/illustrations/shield.png')}
					/>
				</View>
				<View style={styles.buttons}>
					<Button
						style={styles.button}
						size="lg"
						text="Secure wallet"
						onPress={handlePIN}
					/>
					<View style={styles.divider} />
					<Button
						style={styles.button}
						size="lg"
						variant="secondary"
						text="Later"
						onPress={handleLater}
					/>
				</View>
			</View>
		</BottomSheetWrapper>
	);
};

const styles = StyleSheet.create({
	root: {
		alignItems: 'center',
		flex: 1,
		paddingHorizontal: 32,
	},
	title: {
		marginBottom: 25,
	},
	imageContainer: {
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
		height: 210,
		width: 210,
	},
	image: {
		width: 150,
		height: 150,
	},
	glow: {
		position: 'absolute',
	},
	buttons: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	button: {
		flex: 1,
	},
	divider: {
		flex: 0.3,
	},
});

export default memo(PINPrompt);
