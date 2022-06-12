import React, { ReactElement, useState } from 'react';
import { TextInput, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { Alert, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import { BasicProfile } from '../../store/types/slashtags';
import { setActiveProfile, updateProfile } from '../../store/actions/slashtags';
import { useNavigation } from '@react-navigation/native';

const UpdateProfile = (): ReactElement => {
	const navigation = useNavigation();

	const [name, setName] = useState('');

	const onUpdate = async (): Promise<void> => {
		if (!name) {
			return;
		}

		const basicProfile: BasicProfile = {
			name: name,
			type: 'Person',
		};

		updateProfile(name, { basicProfile });
		setActiveProfile(name);

		Alert.alert('Profile updated');
		navigation.goBack();
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
