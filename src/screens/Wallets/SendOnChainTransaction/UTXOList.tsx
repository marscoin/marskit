import React, { memo, ReactElement, useMemo } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
} from '../../../styles/components';
import { Linking, StyleSheet, Switch } from 'react-native';
import Modal from 'react-native-modal';
import Button from '../../../components/Button';
import {
	getBlockExplorerLink,
	getTransactionInputValue,
} from '../../../utils/wallet/transactions';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { addTxInput, removeTxInput } from '../../../store/actions/wallet';
import { EWallet, IUtxo } from '../../../store/types/wallet';
import { TAvailableNetworks } from '../../../utils/networks';

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

/**
 * Links user to the specified tx in a block explorer.
 * @param {string} txHash
 * @param {TAvailableNetworks} selectedNetwork
 */
const onHashPress = async ({
	txHash = '',
	selectedNetwork = EWallet.selectedNetwork,
}: {
	txHash: string;
	selectedNetwork: TAvailableNetworks;
}): Promise<void> => {
	const link = getBlockExplorerLink(txHash, 'tx', selectedNetwork);
	if (await Linking.canOpenURL(link)) {
		await Linking.openURL(link);
	}
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

const UTXOList = ({
	isVisible = false,
	closeList = (): null => null,
}: {
	isVisible?: boolean;
	closeList?: () => any;
} = {}): ReactElement => {
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
	const utxos =
		useSelector(
			(state: Store) =>
				state.wallet.wallets[selectedWallet]?.utxos[selectedNetwork],
		) ?? [];

	const inputs = useMemo(() => transaction.inputs, [transaction?.inputs]);

	const inputKeys = useMemo(
		() => inputs.map((input) => getUtxoKey(input)),
		[inputs],
	);

	const txInputValue = useMemo(
		() => getTransactionInputValue({ selectedNetwork, selectedWallet }),
		[selectedWallet, selectedNetwork, transaction?.inputs],
	);

	return (
		<Modal
			isVisible={isVisible}
			useNativeDriver
			useNativeDriverForBackdrop
			onBackButtonPress={closeList}
			onBackdropPress={closeList}
			hasBackdrop>
			<View style={styles.container}>
				<Text style={styles.title}>UTXO List</Text>
				<ScrollView style={styles.scrollView}>
					<View color={'surface'} style={styles.divider} />
					{utxos.map((utxo) => {
						const key = getUtxoKey(utxo);
						const isEnabled = inputKeys.includes(key);
						const title = `Hash: ${utxo.tx_hash.substr(0, 10)}...\nValue: ${
							utxo.value
						}`;
						return (
							<View key={title}>
								<View style={styles.row}>
									<TouchableOpacity
										activeOpacity={0.7}
										onPress={(): Promise<void> =>
											onHashPress({ txHash: utxo.tx_hash, selectedNetwork })
										}
										color="transparent"
										style={styles.leftColumn}>
										<Text color="white" style={styles.text}>
											{title}
										</Text>
									</TouchableOpacity>
									<View color="transparent" style={styles.rightColumn}>
										<Switch
											trackColor={{ false: '#767577', true: '#81b0ff' }}
											thumbColor={'#f4f3f4'}
											ios_backgroundColor="#3e3e3e"
											onValueChange={(): void =>
												onSwitchPress({
													input: utxo,
													isEnabled,
													selectedWallet,
													selectedNetwork,
												})
											}
											value={isEnabled}
										/>
									</View>
								</View>
								<View color={'surface'} style={styles.divider} />
							</View>
						);
					})}
				</ScrollView>
				<View style={styles.footer}>
					<Text style={styles.footerText}>Amount Available:</Text>
					<Text style={styles.footerText}>{txInputValue}</Text>
					<Button
						style={styles.footerButton}
						color={'onSurface'}
						text="Close"
						onPress={closeList}
					/>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '90%',
		height: '80%',
		alignSelf: 'center',
		padding: 20,
	},
	scrollView: {
		flex: 1,
		marginTop: 10,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		paddingVertical: 8,
		justifyContent: 'flex-start',
	},
	divider: {
		height: 1,
		marginVertical: 5,
	},
	title: {
		fontWeight: 'bold',
		fontSize: 16,
		textAlign: 'center',
	},
	text: {
		fontSize: 14,
	},
	leftColumn: {
		flex: 1,
		justifyContent: 'center',
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
		left: 20,
		right: 20,
	},
	footerText: {
		alignSelf: 'center',
	},
	footerButton: {
		marginTop: 20,
	},
});

export default memo(UTXOList);
