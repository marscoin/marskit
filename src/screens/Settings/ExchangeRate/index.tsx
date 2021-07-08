import React, { memo, ReactElement } from 'react';
import RadioButtonRN from 'radio-buttons-react-native';
import { ScrollView, StyleSheet } from 'react-native';
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
	exchangeRateServices,
	supportedExchangeTickers,
} from '../../../utils/exchange-rate';
import { updateSettings } from '../../../store/actions/settings';
import useDisplayValues from '../../../utils/exchange-rate/useDisplayValues';
import { updateExchangeRates } from '../../../store/actions/wallet';
import { TBitcoinUnit } from '../../../store/types/wallet';

type RadioButtonItem = { label: string; value: string };

const ExchangeRateSettings = ({ navigation }): ReactElement => {
	const settings = useSelector((state: Store) => state.settings);
	const itemStyle = { color: themes[settings.theme].colors.text };
	const activeColor = themes[settings.theme].colors.onBackground;

	const exchangeRateProviders = Object.keys(EExchangeRateService).filter(
		(key) => isNaN(Number(EExchangeRateService[key])),
	);
	const selectedExchangeRateService = settings.exchangeRateService;
	const selectedCurrency = settings.selectedCurrency;
	const selectedBitcoinUnit = settings.bitcoinUnit;
	const bitcoinUnits: TBitcoinUnit[] = ['BTC', 'satoshi'];

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

	const onSetBitcoinUnit = (unit: TBitcoinUnit): void => {
		updateSettings({ bitcoinUnit: unit });
	};

	const { bitcoinFormatted, bitcoinSymbol, fiatFormatted, fiatSymbol } =
		useDisplayValues(100000000);

	const selectedServiceKey = selectedExchangeRateService
		? EExchangeRateService[selectedExchangeRateService]
		: EExchangeRateService.bitfinex;

	let services: RadioButtonItem[] = [];
	let initialServiceIndex = -1;
	exchangeRateProviders.forEach((service, index) => {
		services.push({ label: exchangeRateServices[service], value: service });

		if (service === selectedExchangeRateService) {
			initialServiceIndex = index + 1;
		}
	});

	let tickers: RadioButtonItem[] = [];
	let initialTickerIndex = -1;
	(supportedExchangeTickers[selectedServiceKey] ?? []).forEach(
		(ticker, index) => {
			tickers.push({ label: ticker, value: ticker });
			if (ticker === selectedCurrency) {
				initialTickerIndex = index + 1;
			}
		},
	);

	let units: RadioButtonItem[] = [];
	let initialUnitIndex = -1;
	bitcoinUnits.forEach((unit, index) => {
		units.push({ label: unit, value: unit });
		if (selectedBitcoinUnit === unit) {
			initialUnitIndex = index + 1;
		}
	});

	const radioButtonProps = {
		box: false,
		textStyle: itemStyle,
		activeColor,
	};

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

			<ScrollView>
				<Text style={styles.titleText}>Exchange rate provider</Text>
				<RadioButtonRN
					{...radioButtonProps}
					data={services}
					selectedBtn={(e): void => onSetExchangeRateService(e.value)}
					initial={initialServiceIndex}
				/>

				<Text style={styles.titleText}>Display currency</Text>
				<RadioButtonRN
					{...radioButtonProps}
					data={tickers}
					selectedBtn={(e): void => {
						if (e) {
							onSetCurrency(e.value);
						}
					}}
					initial={initialTickerIndex}
				/>

				<Text style={styles.titleText}>Bitcoin display unit</Text>

				<RadioButtonRN
					{...radioButtonProps}
					data={units}
					selectedBtn={(e): void => onSetBitcoinUnit(e.value)}
					initial={initialUnitIndex}
				/>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
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

export default memo(ExchangeRateSettings);
