import React, {
	memo,
	ReactElement,
	useCallback,
	useMemo,
	useState,
} from 'react';
import { StyleSheet, RefreshControl, FlatList } from 'react-native';
import { View, Text02S, Text02M, Caption13S } from '../../../styles/components';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import NavigationHeader from '../../../components/NavigationHeader';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { getTransactionInputValue } from '../../../utils/wallet/transactions';
import { IUtxo } from '../../../store/types/wallet';
import { TAvailableNetworks } from '../../../utils/networks';
import { addTxInput, removeTxInput } from '../../../store/actions/wallet';
import Button from '../../../components/Button';
import { toggleView } from '../../../store/actions/user';
import { getDisplayValues } from '../../../utils/exchange-rate';
import { IDisplayValues } from '../../../utils/exchange-rate/types';
import SwitchRow from '../../../components/SwitchRow';
const preferences = {
	small: "Small: Use smallest UTXO's first.",
	large: "Large: Use largest UTXO's first.",
	consolidate: "Consolidate: Combine all UTXO's.",
};

/**
 * Adds/Removes the specified input from the current transaction.
 * @param {IUtxo} input
 * @param {boolean} isEnabled
 * @param {string} selectedWallet
 * @param {TAvailableNetworks} selectedNetwork
 */
const onSwitchPress = ({
	input,
	isEnabled,
	selectedWallet,
	selectedNetwork,
}: {
	input: IUtxo;
	isEnabled: boolean;
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
}): void => {
	if (isEnabled) {
		removeTxInput({ input, selectedWallet, selectedNetwork });
	} else {
		addTxInput({ input, selectedWallet, selectedNetwork });
	}
};

const closeList = (): void => {
	toggleView({
		view: 'coinSelection',
		data: {
			isOpen: false,
		},
	}).then();
};

const CoinSelection = (): ReactElement => {
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);
	const transaction = useSelector(
		(state: Store) =>
			state.wallet.wallets[selectedWallet].transaction[selectedNetwork],
	);
	const utxos: IUtxo[] =
		useSelector(
			(state: Store) =>
				state.wallet.wallets[selectedWallet]?.utxos[selectedNetwork],
		) ?? [];

	const coinSelectPreference = useSelector(
		(state: Store) => state.settings.coinSelectPreference,
	);

	const preference = useMemo(
		() => preferences[coinSelectPreference],
		[coinSelectPreference],
	);

	const inputs = useMemo(() => transaction.inputs, [transaction?.inputs]);

	const [autoSelectionEnabled, setAutoSelectionEnabled] = useState(
		inputs?.length === utxos?.length,
	);

	/**
	 * Some UTXO's may contain the same tx_hash.
	 * So we include the tx_pos to ensure we can quickly distinguish.
	 * @param {IUtxo} utxo
	 * @return string
	 */
	const getUtxoKey = (utxo: IUtxo): string => {
		try {
			return `${utxo.tx_hash}${utxo.tx_pos}`;
		} catch {
			return '';
		}
	};

	const inputKeys = useMemo(
		() => inputs.map((input) => getUtxoKey(input)),
		[inputs],
	);

	const txInputValue = useMemo(
		() => getTransactionInputValue({ selectedNetwork, selectedWallet }),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selectedWallet, selectedNetwork, transaction?.inputs],
	);
	const selectedCurrency = useSelector(
		(state: Store) => state.settings.selectedCurrency,
	);
	const exchangeRates = useSelector(
		(state: Store) => state.wallet.exchangeRates,
	);
	const exchangeRate = exchangeRates[selectedCurrency].rate;

	const getBtcValueText = (displayValue: IDisplayValues): string =>
		`${
			displayValue.bitcoinFormatted
		} ${displayValue.bitcoinTicker.toLocaleLowerCase()}`;
	const getFiatValueText = (displayValue: IDisplayValues): string =>
		`${displayValue.fiatSymbol} ${displayValue.fiatFormatted}`;

	const onAutoSelectionPress = async (): Promise<void> => {
		// If disabled, iterate over all utxos and re-add them to inputs if previously removed.
		if (!autoSelectionEnabled) {
			setAutoSelectionEnabled(true);
			await Promise.all(
				utxos.map((utxo) => {
					const key = getUtxoKey(utxo);
					const isEnabled = inputKeys.includes(key);
					if (!isEnabled) {
						addTxInput({ input: utxo, selectedWallet, selectedNetwork });
					}
				}),
			);
		} else {
			setAutoSelectionEnabled(false);
		}
	};

	const UtxoRow = useCallback(
		({ item }): ReactElement => {
			const key = getUtxoKey(item);
			const isEnabled = inputKeys.includes(key);
			const displayValue = getDisplayValues({
				satoshis: item.value,
				exchangeRate,
			});
			const utxoValue = getBtcValueText(displayValue);
			const flatValue = getFiatValueText(displayValue);
			const onPress = (): void => {
				onSwitchPress({
					input: item,
					isEnabled,
					selectedWallet,
					selectedNetwork,
				});
				if (autoSelectionEnabled) {
					setAutoSelectionEnabled(false);
				}
			};
			return (
				<SwitchRow onPress={onPress} isEnabled={isEnabled}>
					<View color="onSurface" style={styles.row}>
						<Text02M>{utxoValue}</Text02M>
						<View style={styles.dot} />
						<Caption13S>{flatValue}</Caption13S>
					</View>
				</SwitchRow>
			);
		},
		//eslint-disable-next-line react-hooks/exhaustive-deps
		[utxos, transaction?.inputs?.length, autoSelectionEnabled],
	);

	const displayValue = useMemo(() => {
		return getDisplayValues({
			satoshis: txInputValue,
			exchangeRate,
		});
	}, [txInputValue, exchangeRate]);

	const totalUtxoValues = useMemo(
		() => getBtcValueText(displayValue),
		[displayValue],
	);

	const totalFiatValue = useMemo(
		() => getFiatValueText(displayValue),
		[displayValue],
	);

	return (
		<BottomSheetWrapper view="coinSelection">
			<View color="onSurface" style={styles.container}>
				<NavigationHeader title="Coin Selection" displayBackButton={false} />

				<SwitchRow
					onPress={onAutoSelectionPress}
					isEnabled={autoSelectionEnabled}>
					<>
						<Text02M>Auto</Text02M>
						<Caption13S>{preference}</Caption13S>
					</>
				</SwitchRow>

				<FlatList
					style={styles.flatList}
					data={utxos}
					renderItem={UtxoRow}
					keyExtractor={(item): string => `${item.tx_hash}${item.tx_pos}`}
					refreshControl={
						<RefreshControl refreshing={false} onRefresh={closeList} />
					}
				/>
				<View color="onSurface" style={styles.footer}>
					<View color="onSurface" style={styles.row}>
						<View color="onSurface" style={styles.leftColumn}>
							<Text02S>Total Selected:</Text02S>
						</View>
						<View color="onSurface" style={styles.rightColumn}>
							<Text02M>{totalFiatValue}</Text02M>
							<Text02M color={'gray'}>{totalUtxoValues}</Text02M>
						</View>
					</View>

					<Button
						style={styles.footerButton}
						color={'gray4'}
						text="Done"
						onPress={closeList}
					/>
				</View>
			</View>
		</BottomSheetWrapper>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	flatList: {
		flex: 1,
	},
	row: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center',
	},
	dot: {
		marginHorizontal: 4,
		height: 2,
		width: 2,
		backgroundColor: 'white',
		alignSelf: 'center',
		borderRadius: 100,
	},
	leftColumn: {
		flex: 1,
		justifyContent: 'center',
		paddingLeft: 16,
	},
	rightColumn: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-end',
		alignSelf: 'center',
		paddingRight: 10,
	},
	footer: {
		position: 'absolute',
		bottom: 20,
		left: 0,
		right: 0,
	},
	footerButton: {
		marginTop: 20,
		borderRadius: 76,
		width: '75%',
		paddingVertical: 10,
		alignSelf: 'center',
	},
});

export default memo(CoinSelection);
