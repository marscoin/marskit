import React, { memo, ReactElement, useCallback } from 'react';
import {
	resetOnChainTransaction,
	setupOnChainTransaction,
} from '../../../store/actions/wallet';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import Send from './index';

const SendBottomSheet = (): ReactElement => {
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const assetName = useSelector(
		(state: Store) => state.user.viewController.send.assetName ?? '',
	);

	const onClose = useCallback(() => {
		resetOnChainTransaction({ selectedWallet, selectedNetwork });
	}, [selectedNetwork, selectedWallet]);

	return (
		<BottomSheetWrapper
			view="send"
			onOpen={setupOnChainTransaction}
			onClose={onClose}>
			<Send asset={assetName} />
		</BottomSheetWrapper>
	);
};

export default memo(SendBottomSheet);
