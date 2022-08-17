import React, { memo, ReactElement, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import AssetPickerList from '../../../components/AssetPickerList';
import { toggleView } from '../../../store/actions/user';
import { capitalize } from '../../../utils/helpers';
import { SendAssetPickerNavigationProp } from '../../../navigation/bottom-sheet/SendAssetPicker';

const SendAssetPickerList = (): ReactElement => {
	const navigation = useNavigation<SendAssetPickerNavigationProp>();
	const onAssetPress = useCallback((asset) => {
		toggleView({
			view: 'sendAssetPicker',
			data: {
				isOpen: true,
				snapPoint: 1,
				asset,
				assetName: capitalize(asset),
			},
		});
		navigation.navigate('send');
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return <AssetPickerList headerTitle="Send" onAssetPress={onAssetPress} />;
};

export default memo(SendAssetPickerList);
