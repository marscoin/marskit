import React, { memo, ReactElement, useCallback } from 'react';
import AssetPickerList from '../../../components/AssetPickerList';

const ReceiveAssetPickerList = ({ navigation }): ReactElement => {
	const onAssetPress = useCallback(
		(asset) => {
			navigation.navigate('Receive', { asset });
		},
		[navigation],
	);
	return <AssetPickerList headerTitle="Receive" onAssetPress={onAssetPress} />;
};

export default memo(ReceiveAssetPickerList);
