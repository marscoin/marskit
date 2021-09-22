import React, { memo, ReactElement, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
	Feather,
	Text,
	TouchableOpacity,
	RadioButtonRN,
} from '../../../styles/components';
import { updateSettings } from '../../../store/actions/settings';
import {
	RadioButtonItem,
	TCoinSelectPreference,
} from '../../../store/types/settings';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import SafeAreaView from '../../../components/SafeAreaView';

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

const CoinSelect = ({ navigation }): ReactElement => {
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
		<SafeAreaView style={styles.container}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={navigation.goBack}
				style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>Settings</Text>
			</TouchableOpacity>

			<ScrollView>
				<Text style={styles.titleText}>Coin-Select Preference</Text>
				<RadioButtonRN
					data={radioButtons}
					selectedBtn={(e): void => setCoinSelectPreference(e.value)}
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

export default memo(CoinSelect);
