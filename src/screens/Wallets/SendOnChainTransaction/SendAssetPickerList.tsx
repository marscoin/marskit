import React, { memo, ReactElement, useCallback } from 'react';
import AssetPickerList from '../../../components/AssetPickerList';

const SendAssetPickerList = ({ navigation }): ReactElement => {
	const onAssetPress = useCallback(
		(asset) => {
			navigation.navigate('AddressAndAmount', { asset });
		},
		[navigation],
	);
	return (
		<AssetPickerList
			headerTitle="Send Bitcoin"
			side="send"
			onAssetPress={onAssetPress}
		/>
	);
};

export default memo(SendAssetPickerList);
