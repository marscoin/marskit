import React, { memo, ReactElement, useCallback } from 'react';
import AssetPickerList from '../../../components/AssetPickerList';
import { toggleView } from '../../../store/actions/user';
import { capitalize } from '../../../utils/helpers';
import { useNavigation } from '@react-navigation/native';

const SendAssetPickerList = (): ReactElement => {
	const navigation = useNavigation();
	const onAssetPress = useCallback((asset) => {
		toggleView({
			view: 'sendAssetPicker',
			data: {
				isOpen: true,
				snapPoint: 1,
				asset,
				assetName: capitalize(asset),
			},
		}).then();
		// @ts-ignore
		navigation.navigate('send');
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return <AssetPickerList headerTitle="Send" onAssetPress={onAssetPress} />;
};

export default memo(SendAssetPickerList);
