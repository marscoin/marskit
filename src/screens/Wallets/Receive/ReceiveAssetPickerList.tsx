import React, { memo, ReactElement, useCallback } from 'react';
import AssetPickerList from '../../../components/AssetPickerList';
import { useNavigation } from '@react-navigation/native';
import { toggleView } from '../../../store/actions/user';
import { capitalize } from '../../../utils/helpers';

const ReceiveAssetPickerList = (): ReactElement => {
	const navigation = useNavigation();
	const onAssetPress = useCallback((asset) => {
		toggleView({
			view: 'receiveAssetPicker',
			data: {
				isOpen: true,
				snapPoint: 1,
				asset,
				assetName: capitalize(asset),
			},
		}).then();
		// @ts-ignore
		navigation.navigate('receive');
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return <AssetPickerList headerTitle="Receive" onAssetPress={onAssetPress} />;
};

export default memo(ReceiveAssetPickerList);
