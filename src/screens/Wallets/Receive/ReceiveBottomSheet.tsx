import React, { memo, ReactElement } from 'react';
import { setupOnChainTransaction } from '../../../store/actions/wallet';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import Receive from './index';

const ReceiveBottomSheet = (): ReactElement => {
	const assetName = useSelector(
		(state: Store) => state.user.viewController.receive.assetName ?? '',
	);

	return (
		<BottomSheetWrapper view="receive" onOpen={setupOnChainTransaction}>
			<Receive asset={assetName} />
		</BottomSheetWrapper>
	);
};

export default memo(ReceiveBottomSheet);
