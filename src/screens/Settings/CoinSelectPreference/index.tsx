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
import SafeAreaInsets from '../../../components/SafeAreaInsets';

const SelectAutoRB: RadioButtonItem[] = [
	{ label: 'Manual', value: 'manual' },
	{ label: 'Autopilot', value: 'autopilot' },
];

const SelectPreferenceRB: RadioButtonItem[] = [
	{
		label: "Small: Use smallest UTXO's first.",
		value: 'small',
	},
	{
		label: "Large: Use largest UTXO's first.",
		value: 'large',
	},
	{
		label: "Consolidate: Combine all UTXO's.",
		value: 'consolidate',
	},
];

const setCoinSelectAuto = (preference: boolean): void => {
	updateSettings({ coinSelectAuto: preference });
};

const setCoinSelectPreference = (preference: TCoinSelectPreference): void => {
	updateSettings({ coinSelectPreference: preference });
};

const CoinSelect = (): ReactElement => {
	const coinSelectPreference = useSelector(
		(state: Store) => state.settings.coinSelectPreference,
	);
	const coinSelectAuto = useSelector(
		(state: Store) => state.settings.coinSelectAuto,
	);

	const SelectAutoIndex = useMemo((): number => {
		return (
			SelectAutoRB.findIndex(
				({ value }) => (coinSelectAuto ? 'autopilot' : 'manual') === value,
			) + 1
		);
	}, [coinSelectAuto]);

	const SelectPreferenceIndex = useMemo((): number => {
		return (
			SelectPreferenceRB.findIndex(
				({ value }) => value === coinSelectPreference,
			) + 1
		);
	}, [coinSelectPreference]);

	return (
		<View style={styles.container}>
			<SafeAreaInsets type="top" />
			<NavigationHeader title="Coin Select Preference" />
			<ScrollView style={styles.content}>
				<Text style={styles.titleText}>Autopilot mode</Text>
				<RadioButtonRN
					data={SelectAutoRB}
					selectedBtn={(e): void => setCoinSelectAuto(e.value === 'autopilot')}
					initial={SelectAutoIndex}
				/>

				<Text style={styles.titleText}>Coin selection method</Text>
				<RadioButtonRN
					data={SelectPreferenceRB}
					selectedBtn={(e): void => setCoinSelectPreference(e.value)}
					initial={SelectPreferenceIndex}
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
