import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import { Caption13Up, View } from '../styles/components';
import { StyleSheet } from 'react-native';
import { getAssetNames, getBalance } from '../utils/wallet';
import AssetPicker from './AssetPicker';
import NavigationHeader from './NavigationHeader';

const AssetPickerList = ({
	headerTitle,
	onAssetPress = (): null => null,
}: {
	headerTitle?: string;
	onAssetPress?: Function;
}): ReactElement => {
	const assetNames = useMemo(() => getAssetNames({}), []);
	const onPress = useCallback(
		(asset) => {
			onAssetPress(asset);
		},
		//eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const assets = useMemo(
		() => {
			return assetNames.map((asset, i) => {
				const sats = getBalance({
					onchain: asset === 'bitcoin',
					lightning: asset === 'lightning',
				}).satoshis;
				return (
					<AssetPicker
						key={i}
						assetName={asset}
						sats={sats}
						onPress={onPress}
					/>
				);
			});
		},
		//eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	return (
		<View style={styles.container} color="gray6">
			{headerTitle && (
				<NavigationHeader
					title={headerTitle}
					navigateBack={false}
					displayBackButton={false}
				/>
			)}
			<View style={styles.content}>
				<Caption13Up color="gray1" style={styles.title}>
					ASSETS
				</Caption13Up>
				{assets}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 15,
		backgroundColor: 'transparent',
	},
	title: {
		marginBottom: 10,
	},
});

export default memo(AssetPickerList);
