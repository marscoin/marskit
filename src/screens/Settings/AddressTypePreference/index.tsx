import React, { memo, ReactElement, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, RadioButtonRN, View } from '../../../styles/components';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { getSelectedAddressType } from '../../../utils/wallet';
import { updateSelectedAddressType } from '../../../store/actions/wallet';
import { RadioButtonItem } from '../../../store/types/settings';
import { TAddressType } from '../../../store/types/wallet';
import { capitalize } from '../../../utils/helpers';
import NavigationHeader from '../../../components/NavigationHeader';

const setAddressTypePreference = (preference: TAddressType): void => {
	updateSelectedAddressType({
		addressType: preference,
	});
};

const AddressTypePreference = (): ReactElement => {
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
		<View style={styles.container}>
			<NavigationHeader title="Address Type Preference" />
			<ScrollView style={styles.content}>
				<Text style={styles.titleText}>Address-Type Preference</Text>
				<RadioButtonRN
					data={radioButtons}
					selectedBtn={(e): void => {
						setAddressTypePreference(e.value);
					}}
					initial={initialIndex}
				/>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 20,
	},
	titleText: {
		marginTop: 30,
	},
});

export default memo(AddressTypePreference);
