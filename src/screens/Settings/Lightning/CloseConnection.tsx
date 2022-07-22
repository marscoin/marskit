import React, { ReactElement, memo } from 'react';
import { StyleSheet, View, Image, Alert } from 'react-native';

import { Text01S, View as ThemedView } from '../../../styles/components';
import SafeAreaInsets from '../../../components/SafeAreaInsets';
import NavigationHeader from '../../../components/NavigationHeader';
import Button from '../../../components/Button';
import Glow from '../../../components/Glow';

const CloseConnection = ({ navigation }): ReactElement => {
	return (
		<ThemedView style={styles.root}>
			<SafeAreaInsets type="top" />
			<NavigationHeader title="Are you sure?" />
			<View style={styles.content}>
				<View>
					<Text01S color="gray1" style={styles.text}>
						If you close this Lightning connection the spending balance will be
						transfered to your savings balance (minus closing fees).
					</Text01S>
				</View>

				<View style={styles.imageContainer}>
					<Glow style={styles.glow} size={600} color="red" />
					<Image
						style={styles.image}
						source={require('../../../assets/illustrations/switch.png')}
					/>
				</View>

				<View>
					<View style={styles.buttons}>
						<Button
							style={styles.button}
							text="Cancel"
							size="large"
							variant="secondary"
							onPress={navigation.goBack}
						/>
						<Button
							style={styles.button}
							text="Close"
							size="large"
							onPress={(): void => {
								Alert.alert('TODO');
							}}
						/>
					</View>
					<SafeAreaInsets type="bottom" />
				</View>
			</View>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	content: {
		flex: 1,
		display: 'flex',
		justifyContent: 'space-between',
		marginTop: 8,
		paddingHorizontal: 16,
	},
	text: {
		marginTop: 16,
		marginBottom: 16,
	},
	imageContainer: {
		height: 300,
		width: 300,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		alignSelf: 'center',
	},
	glow: {
		position: 'absolute',
	},
	image: {
		height: 200,
		width: 200,
		resizeMode: 'contain',
	},
	buttons: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: -8,
		marginBottom: 8,
	},
	button: {
		marginHorizontal: 8,
		flex: 1,
	},
});

export default memo(CloseConnection);
