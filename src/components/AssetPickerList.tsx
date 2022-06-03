import React, { memo, ReactElement, useMemo } from 'react';
import { StyleSheet, Image, View, TouchableOpacity } from 'react-native';

import {
	Caption13Up,
	BitcoinCircleIcon,
	LightningIcon,
	Text01M,
} from '../styles/components';
import { getAssetNames } from '../utils/wallet';
import { capitalize } from '../utils/helpers';
import NavigationHeader from './NavigationHeader';
import Glow from './Glow';

const Asset = memo(({ name, onPress }: { name: string; onPress(): void }) => {
	const AssetIcon = useMemo(() => {
		switch (name) {
			case 'bitcoin':
				return BitcoinCircleIcon;
			case 'lightning':
				return LightningIcon;
			default:
				return BitcoinCircleIcon;
		}
	}, [name]);

	return (
		<TouchableOpacity style={styles.assertRoot} onPress={onPress}>
			<View style={styles.assertName}>
				<View style={styles.assertIcon}>
					<AssetIcon />
				</View>
				<Text01M>{capitalize(name)}</Text01M>
			</View>
			{/*<Text01M color="gray1">TODO show asset ticker</Text01M>*/}
		</TouchableOpacity>
	);
});

const AssetPickerList = ({
	headerTitle,
	onAssetPress = (): null => null,
}: {
	headerTitle?: string;
	onAssetPress?: Function;
}): ReactElement => {
	const assetNames = useMemo(() => getAssetNames({}), []);

	return (
		<View style={styles.container}>
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
				{assetNames.map((asset) => (
					<Asset
						key={asset}
						name={asset}
						onPress={(): void => onAssetPress(asset)}
					/>
				))}
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
	},
	image: {
		width: 150,
		height: 150,
	},
	assertRoot: {
		height: 80,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
	},
	assertName: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	assertIcon: {
		width: 48,
	},
});

export default memo(AssetPickerList);
