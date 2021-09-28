import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import { View, Text01M } from '../../../styles/components';
import { StyleSheet } from 'react-native';
import { TAssetType } from '../../../store/types/wallet';
import { capitalize } from '../../../utils/helpers';
import { resetOnChainTransaction } from '../../../store/actions/wallet';
import { refreshWallet } from '../../../utils/wallet';
import SendOnChainTransaction from '../SendOnChainTransaction';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';

const Send = ({
	assetType,
	onComplete = (): null => null,
}: {
	assetType?: TAssetType;
	onComplete?: Function;
}): ReactElement => {
	const header = useMemo(
		(): string => (assetType ? `Send ${capitalize(assetType)}` : 'Send'),
		[assetType],
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);

	const _onComplete = useCallback(() => {
		resetOnChainTransaction({
			selectedWallet,
			selectedNetwork,
		});
		setTimeout(() => {
			refreshWallet().then();
		}, 4000);
		onComplete();
	}, [selectedWallet, selectedNetwork]);

	return (
		<View style={styles.container}>
			<Text01M style={styles.headerText}>{header}</Text01M>
			<View style={styles.content} />
			<SendOnChainTransaction header={false} onComplete={_onComplete} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		marginTop: 20,
	},
	headerText: {
		alignSelf: 'center',
	},
});

export default memo(Send);
