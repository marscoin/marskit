import React, { memo, ReactElement } from 'react';
import { Picker } from '@react-native-picker/picker';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import {
	Feather,
	Text,
	TouchableOpacity,
	View,
} from '../../../styles/components';
import Store from '../../../store/types';
import themes from '../../../styles/themes';
import {
	EExchangeRateService,
	supportedExchangeTickers,
} from '../../../utils/exchange-rate';
import { updateSettings } from '../../../store/actions/settings';
import useDisplayValues from '../../../utils/exchange-rate/useDisplayValues';
import { updateExchangeRates } from '../../../store/actions/wallet';

const ExchangeRateSettings = ({ navigation }): ReactElement => {
	const settings = useSelector((state: Store) => state.settings);
	const itemStyle = { color: themes[settings.theme].colors.text };

	const exchangeRateProviders = Object.keys(EExchangeRateService).filter(
		(key) => isNaN(Number(EExchangeRateService[key])),
	);
	const selectedExchangeRateService = settings.exchangeRateService;
	const selectedCurrency = settings.selectedCurrency;

	const onSetExchangeRateService = (provider: EExchangeRateService): void => {
		updateSettings({ exchangeRateService: provider });

		setTimeout(() => {
			updateExchangeRates().then();

			//Check if we support the current currency on this provider
			const availableTickers =
				supportedExchangeTickers[EExchangeRateService[provider]];
			if (!availableTickers.includes(selectedCurrency)) {
				updateSettings({ selectedCurrency: availableTickers[0] });
			}
		}, 250);
	};

	const onSetCurrency = (currency: String): void => {
		updateSettings({ selectedCurrency: currency });
	};

	const { bitcoinFormatted, bitcoinSymbol, fiatFormatted, fiatSymbol } =
		useDisplayValues(100000000);

	const service = selectedExchangeRateService
		? EExchangeRateService[selectedExchangeRateService]
		: EExchangeRateService.bitfinex;

	const tickers = supportedExchangeTickers[service] ?? [];

	return (
		<View style={styles.container}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={navigation.goBack}
				style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>Settings</Text>
			</TouchableOpacity>
			<Text style={styles.titleText}>
				{bitcoinSymbol}
				{bitcoinFormatted} = {fiatSymbol}
				{fiatFormatted}
			</Text>

			<Text style={styles.titleText}>Display currency</Text>
			<Picker
				itemStyle={itemStyle}
				selectedValue={selectedCurrency}
				onValueChange={(itemValue: string) => onSetCurrency(itemValue)}>
				{tickers.map((currency) => (
					<Picker.Item key={currency} label={currency} value={currency} />
				))}
			</Picker>

			<Text style={styles.titleText}>Exchange rate provider</Text>
			<Picker
				itemStyle={itemStyle}
				selectedValue={selectedExchangeRateService}
				onValueChange={(itemValue: EExchangeRateService) =>
					onSetExchangeRateService(itemValue)
				}>
				{exchangeRateProviders.map((provider) => (
					<Picker.Item
						key={provider}
						label={EExchangeRateService[provider]}
						value={provider}
					/>
				))}
			</Picker>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
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
		textAlign: 'center',
		marginTop: 20,
	},
});

export default memo(ExchangeRateSettings);
