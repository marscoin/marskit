import React, { ReactElement } from 'react';
import { Text, View } from '../../styles/components';
import { Alert, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import { createNewWallet } from '../../utils/startup';
import { showErrorNotification } from '../../utils/notifications';

const OnboardingWelcomeScreen = ({
	navigation,
}: {
	navigation: any;
}): ReactElement => {
	const onRestorePress = (): void => {
		Alert.alert('Restore', '', [
			{
				text: 'From backup server',
				onPress: (): void => navigation.navigate('RestoreAccount'),
			},
			{
				text: 'From file',
				onPress: (): void => navigation.navigate('RestoreAccountFromFile'),
			},
			{
				text: 'Cancel',
				onPress: (): void => {},
				style: 'cancel',
			},
		]);
	};

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Welcome</Text>

				<Button
					style={styles.button}
					text={'Create new account'}
					onPress={(): void => {
						navigation.navigate('CreateAccount');
					}}
				/>
				<Button
					style={styles.button}
					text={'Restore'}
					onPress={onRestorePress}
				/>
				<Button
					style={styles.button}
					text={'Skip (no automated backups)'}
					onPress={async (): Promise<void> => {
						const res = await createNewWallet();
						if (res.isErr()) {
							showErrorNotification({
								title: 'Wallet creation failed',
								message: res.error.message,
							});
						}
					}}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
	},
	title: {
		fontSize: 24,
		marginBottom: 50,
		textAlign: 'center',
	},
	button: {
		marginTop: 10,
	},
});

export default OnboardingWelcomeScreen;
