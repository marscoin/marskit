import React, { memo, ReactElement } from 'react';
import { setupOnChainTransaction } from '../../../store/actions/wallet';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import Receive from './index';

const ReceiveBottomSheet = (): ReactElement => {
	const assetType = useSelector(
		(state: Store) => state.user.viewController.receive.id,
	);

	return (
		<BottomSheetWrapper view="receive" onOpen={setupOnChainTransaction}>
			<Receive asset={assetType} />
		</BottomSheetWrapper>
	);
};

export default memo(ReceiveBottomSheet);
