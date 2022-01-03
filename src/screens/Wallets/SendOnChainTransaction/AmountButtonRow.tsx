import React, { memo, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity, View } from '../../../styles/components';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { sendMax } from '../../../utils/wallet/transactions';
import { Text02M } from '../../../styles/components';
import { getStore } from '../../../store/helpers';
import { updateSettings } from '../../../store/actions/settings';
import { SvgXml } from 'react-native-svg';
import { toggleView } from '../../../store/actions/user';
import useDisplayValues from '../../../hooks/displayValues';
import { switchIcon } from '../../../assets/icons/wallet';

const switchIconXml = switchIcon();
const AmountButtonRow = (): ReactElement => {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	const balance = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.balance[selectedNetwork],
	);

	const unitPreference = useSelector(
		(state: Store) => state.settings.unitPreference,
	);

	const displayValues = useDisplayValues(balance);

	const max = useSelector(
		(state: Store) =>
			state.wallet.wallets[selectedWallet].transaction[selectedNetwork].max,
	);

	return (
		<View style={styles.topRow}>
			<TouchableOpacity
				style={styles.topRowButtons}
				color={'onSurface'}
				disabled={balance <= 0}
				onPress={sendMax}>
				<Text02M color={max ? 'orange' : 'white'}>Max</Text02M>
			</TouchableOpacity>

			<TouchableOpacity
				color={'onSurface'}
				style={styles.topRowButtons}
				onPress={(): void => {
					const newUnitPreference =
						getStore().settings?.unitPreference === 'asset' ? 'fiat' : 'asset';
					updateSettings({ unitPreference: newUnitPreference });
				}}>
				<SvgXml xml={switchIconXml} width={16.44} height={13.22} />
				<Text02M style={styles.middleButtonText} color="orange">
					{unitPreference === 'asset'
						? displayValues.fiatTicker
						: displayValues.bitcoinTicker.toLocaleLowerCase()}
				</Text02M>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.topRowButtons}
				color={'onSurface'}
				onPress={(): void => {
					toggleView({ view: 'numberPad', data: { isOpen: false } }).then();
				}}>
				<Text02M>Done</Text02M>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	topRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 5,
		paddingHorizontal: 5,
	},
	topRowButtons: {
		paddingVertical: 5,
		paddingHorizontal: 8,
		borderRadius: 20,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	middleButtonText: {
		marginLeft: 8,
	},
});

export default memo(AmountButtonRow);
