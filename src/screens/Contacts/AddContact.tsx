import React, { useEffect, useState } from 'react';
import {
	ClipboardTextIcon,
	CornersOutIcon,
	Text,
	View,
} from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { StyleSheet, Image } from 'react-native';
import Store from '../../store/types';
import { useSelector } from 'react-redux';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import ContactsOnboarding from './ContactsOnboarding';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { useSlashtags } from '../../components/SlashtagsProvider';
import Glow from '../../components/Glow';
import Clipboard from '@react-native-clipboard/clipboard';

export const AddContact = ({ navigation }): JSX.Element => {
	const [inputValue, setInputValue] = useState('');
	const [invalid, setInvalid] = useState(false);
	const [contactID, setContactID] = useState<string | null>(null);

	const onboardedProfile = useSelector(
		(store: Store) => store.slashtags.visitedContacts,
	);

	const { sdk } = useSlashtags();

	useEffect(() => {
		contactID && navigation.navigate('ConfirmContact', { id: contactID });
	}, [contactID]);

	function updateContactID(url: string) {
		setInputValue(url);
		setInvalid(false);

		if (url.length === 0) {
			return;
		}

		try {
			const contact = sdk?.slashtag({ url });
			setContactID(url);
		} catch (error) {
			setInvalid(true);
		}
	}

	async function paste(): Promise<void> {
		const url = await Clipboard.getString();

		// TODO remove before committing
		const hardcode =
			'slash://kyaqmdnwb858fuziw6fnsqhf3bg6o344rg8a5a1sfdh77scy17buana';

		updateContactID(url || hardcode);
	}

	return onboardedProfile ? (
		<View style={styles.container}>
			<SafeAreaInsets type={'top'} />
			<NavigationHeader
				title="Add contact"
				displayBackButton={false}
				onClosePress={(): void => {
					navigation.navigate('Tabs');
				}}
			/>
			<View style={styles.content}>
				<Text style={styles.note} color="gray">
					You can add a contact manually by scanning or pasting their Slashtags
					key below.
				</Text>
				<Text style={styles.label} color="gray">
					Add Slashtags Contact
				</Text>
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.input}
						value={inputValue}
						placeholder="Slashtags key or QR code"
						placeholderTextColor="gray"
						onChangeText={updateContactID}
						multiline={true}
					/>
					<TouchableOpacity style={styles.qrButton}>
						<CornersOutIcon width={24} height={24} color="brand" />
					</TouchableOpacity>
					<TouchableOpacity onPress={paste}>
						<ClipboardTextIcon width={24} height={24} color="brand" />
					</TouchableOpacity>
				</View>
				<View style={styles.invalid}>
					{invalid && (
						<Text color="brand">This is not a valid Slashtags URL.</Text>
					)}
				</View>
				<View style={styles.illustrationContainer}>
					<Image source={require('../../assets/illustrations/user.png')} />
					<Glow size={700} style={styles.glow} color="brand" />
				</View>
			</View>
		</View>
	) : (
		<ContactsOnboarding navigation={navigation} />
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: 'flex-start',
		margin: 20,
		marginTop: 0,
		backgroundColor: 'transparent',
	},
	note: {
		fontSize: 17,
		lineHeight: 22,
	},
	label: {
		fontSize: 13,
		lineHeight: 18,
		textTransform: 'uppercase',
		marginTop: 32,
		marginBottom: 8,
	},
	inputContainer: {
		display: 'flex',
		flexDirection: 'row',

		alignItems: 'flex-start',
		justifyContent: 'space-between',
		padding: 16,

		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
		borderRadius: 8,
	},
	input: {
		flex: 1,
		color: 'white',
	},
	qrButton: {
		marginRight: 16,
		marginLeft: 16,
	},
	invalid: {
		height: 20,
		marginTop: 16,
		backgroundColor: 'transparent',
	},
	illustrationContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		height: '100%',
		width: '100%',
		top: 60,
		zIndex: -1,
	},
	glow: {
		position: 'absolute',
		zIndex: -1,
	},
});

export default AddContact;
