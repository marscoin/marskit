import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import { StyleSheet, Image } from 'react-native';

import { Caption13Up, View } from '../styles/components';
import { getAssetNames, getBalance } from '../utils/wallet';
import AssetPicker from './AssetPicker';
import NavigationHeader from './NavigationHeader';
import Glow from './Glow';

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
					size="sm"
				/>
			)}
			<View style={styles.content}>
				<Caption13Up color="gray1" style={styles.title}>
					ASSETS
				</Caption13Up>
				{assets}
			</View>
			<View style={styles.imageContainer}>
				<Glow style={styles.glow} size={300} color="white" />
				<Image
					source={require('../assets/illustrations/coins.png')}
					style={styles.image}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 15,
		backgroundColor: 'transparent',
	},
	title: {
		marginBottom: 10,
	},
	glow: {
		position: 'absolute',
	},
	imageContainer: {
		position: 'relative',
		alignSelf: 'center',
		height: 300,
		width: 300,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	image: {
		width: 150,
		height: 150,
	},
});

export default memo(AssetPickerList);
