import React, { ReactElement, useContext, useState } from 'react';
import { TextInput, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { Alert, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import {
	SlashtagsContext,
	TBasicProfile,
} from '@synonymdev/react-native-slashtags';
import { updateProfile } from '../../store/actions/slashtags';

const UpdateProfile = (): ReactElement => {
	const slashtags = useContext(SlashtagsContext);

	const [name, setName] = useState('');

	const onUpdate = async () => {
		if (!name) {
			return;
		}

		if (!slashtags.current) {
			return console.warn('Slashtags context not set');
		}

		try {
			const state = await slashtags.current.state();
			if (!state.sdkSetup) {
				//TODO get real seed
				const seed = `todo ${new Date().getTime()}`;
				const keyPair = await slashtags.current.generateSeedKeyPair(seed);

				await slashtags.current.setupSDK({
					primaryKey: keyPair.secretKey,
					relays: ['ws://localhost:8888'],
				});
			}

			const basicProfile: TBasicProfile = {
				name: name,
				type: 'Person',
			};

			//Add to slashtags SDK first
			const res = await slashtags.current.setProfile({
				name,
				basicProfile,
			});

			updateProfile(name, basicProfile);

			//TODO this might not be persistent
			if (res.isNew) {
				Alert.alert('Profile added');
			} else {
				Alert.alert('Profile updated');
			}
		} catch (e) {
			console.error(e);
			Alert.alert('Profile update failed', e.toString());
		}
	};

	return (
		<View style={styles.container}>
			<NavigationHeader title="Add/Update profile" />
			<View style={styles.content}>
				<View>
					<TextInput
						textAlignVertical={'center'}
						underlineColorAndroid="transparent"
						style={styles.textInput}
						placeholder="Username"
						autoCapitalize="none"
						autoCompleteType="off"
						autoCorrect={false}
						onChangeText={setName}
						value={name}
					/>
				</View>

				<Button onPress={onUpdate} text={'Save'} size={'lg'} />
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
		justifyContent: 'space-between',
		margin: 20,
	},
	textInput: {
		minHeight: 50,
		borderRadius: 5,
		fontWeight: 'bold',
		fontSize: 18,
		textAlign: 'center',
		color: 'gray',
		borderBottomWidth: 1,
		borderColor: 'gray',
		paddingHorizontal: 10,
		backgroundColor: 'white',
		marginVertical: 5,
	},
});

export default UpdateProfile;
