import React, { memo, ReactElement, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
	Feather,
	Text,
	TouchableOpacity,
	RadioButtonRN,
} from '../../../styles/components';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { getSelectedAddressType } from '../../../utils/wallet';
import { updateSelectedAddressType } from '../../../store/actions/wallet';
import { RadioButtonItem } from '../../../store/types/settings';
import { TAddressType } from '../../../store/types/wallet';
import { capitalize } from '../../../utils/helpers';
import SafeAreaView from '../../../components/SafeAreaView';

const setAddressTypePreference = (preference: TAddressType): void => {
	updateSelectedAddressType({
		addressType: preference,
	});
};

const AddressTypePreference = ({ navigation }): ReactElement => {
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);

	const addressTypes = useSelector((state: Store) => state.wallet.addressTypes);

	const radioButtons: RadioButtonItem[] = useMemo(() => {
		return Object.values(addressTypes).map(({ label, type }) => {
			return { label: capitalize(label), value: type };
		});
	}, [addressTypes]);

	const selectedAddressType = getSelectedAddressType({
		selectedWallet,
		selectedNetwork,
	});

	const initialIndex = useMemo((): number => {
		let index = -1;
		try {
			radioButtons.map((button, i) => {
				if (selectedAddressType === button.value) {
					index = i + 1;
				}
			});
			return index || -1;
		} catch (e) {
			return index;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedAddressType]);

	return (
		<SafeAreaView style={styles.container}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={navigation.goBack}
				style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>Settings</Text>
			</TouchableOpacity>

			<ScrollView>
				<Text style={styles.titleText}>Address-Type Preference</Text>
				<RadioButtonRN
					data={radioButtons}
					selectedBtn={(e): void => {
						setAddressTypePreference(e.value);
					}}
					initial={initialIndex}
				/>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingRight: 20,
		paddingLeft: 20,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 10,
		paddingVertical: 8,
	},
	backText: {
		fontSize: 20,
	},
	titleText: {
		marginTop: 30,
	},
});

export default memo(AddressTypePreference);
