import React, { memo, ReactElement, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, RadioButtonRN } from '../../../styles/components';
import { updateSettings } from '../../../store/actions/settings';
import {
	RadioButtonItem,
	TCoinSelectPreference,
} from '../../../store/types/settings';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { View } from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';

const radioButtons: RadioButtonItem[] = [
	{ label: "Small: Use smallest UTXO's first.", value: 'small' },
	{ label: "Large: Use largest UTXO's first.", value: 'large' },
	{
		label: "Consolidate: Combine all UTXO's.",
		value: 'consolidate',
	},
];

const setCoinSelectPreference = (preference: TCoinSelectPreference): void => {
	updateSettings({ coinSelectPreference: preference });
};

const CoinSelect = (): ReactElement => {
	const coinSelectPreference = useSelector(
		(state: Store) => state.settings.coinSelectPreference,
	);

	const initialIndex = useMemo((): number => {
		let index = -1;
		try {
			radioButtons.map((button, i) => {
				if (coinSelectPreference === button.value) {
					index = i + 1;
				}
			});
			return index || -1;
		} catch {
			return index;
		}
	}, [coinSelectPreference]);

	return (
		<View style={styles.container}>
			<NavigationHeader title="Coin Select Preference" />
			<ScrollView style={styles.content}>
				<Text style={styles.titleText}>Coin-Select Preference</Text>
				<RadioButtonRN
					data={radioButtons}
					selectedBtn={(e): void => setCoinSelectPreference(e.value)}
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

export default memo(CoinSelect);
