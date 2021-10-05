import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import { View, Text01M } from '../../../styles/components';
import { StyleSheet } from 'react-native';
import { capitalize } from '../../../utils/helpers';
import { resetOnChainTransaction } from '../../../store/actions/wallet';
import { refreshWallet } from '../../../utils/wallet';
import SendOnChainTransaction from '../SendOnChainTransaction';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';

interface ISendProps {
	asset: string;
	onComplete?: Function;
}
const Send = (props: ISendProps): ReactElement => {
	const { asset } = useMemo(
		() => props,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
	const header = useMemo(
		(): string => (asset ? `Send ${capitalize(asset)}` : 'Send'),
		[asset],
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);

	const _onComplete = useCallback(() => {
		if (asset === 'bitcoin') {
			resetOnChainTransaction({
				selectedWallet,
				selectedNetwork,
			});
		}
		setTimeout(() => {
			refreshWallet().then();
		}, 4000);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedWallet, selectedNetwork]);

	return (
		<View style={styles.container}>
			<Text01M style={styles.headerText}>{header}</Text01M>
			<SendOnChainTransaction
				{...props}
				header={false}
				onComplete={_onComplete}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	headerText: {
		alignSelf: 'center',
	},
});

export default memo(Send);
