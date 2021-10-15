import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import {
	View,
	Text02M,
	Caption13M,
	EvilIcon,
	TouchableOpacity,
} from '../styles/components';
import { StyleSheet } from 'react-native';
import useDisplayValues from '../hooks/displayValues';
import Card from './Card';
import { getAssetIcon } from '../utils/wallet';
import { TAssetNetwork } from '../store/types/wallet';
import { capitalize } from '../utils/helpers';

const AssetPicker = ({
	assetName = 'Bitcoin',
	sats = 0,
	onPress = (): null => null,
	hideArrow = false,
}: {
	assetName?: TAssetNetwork | string;
	sats?: number;
	onPress?: Function;
	hideArrow?: boolean;
}): ReactElement => {
	const balances = useDisplayValues(sats);
	const handleOnPress = useCallback(() => {
		onPress(assetName);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [assetName]);

	const AssetIcon: ReactElement = useMemo(
		() => getAssetIcon(assetName),
		[assetName],
	);
	const asset = useMemo(() => {
		return capitalize(assetName);
	}, [assetName]);
	return (
		<TouchableOpacity
			color="transparent"
			onPress={handleOnPress}
			activeOpacity={0.7}>
			<Card style={styles.container} color={'gray336'}>
				<>
					<View style={styles.col1}>
						{/*@ts-ignore*/}
						<AssetIcon />
						<View color="transparent" style={styles.titleContainer}>
							<Text02M>{asset}</Text02M>
							<Caption13M color={'gray1'}>
								Balance: {balances.fiatSymbol}
								{balances.fiatFormatted}
							</Caption13M>
						</View>
					</View>

					{hideArrow && (
						<View color="transparent" style={styles.col2}>
							<EvilIcon name={'chevron-down'} size={30} color="onBackground" />
						</View>
					)}
				</>
			</Card>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 58,
		marginBottom: 8,
		borderRadius: 20,
		paddingHorizontal: 16,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flexDirection: 'row',
	},
	col1: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flexDirection: 'row',
		backgroundColor: 'transparent',
	},
	col2: {
		display: 'flex',
		alignContent: 'flex-end',
		backgroundColor: 'transparent',
	},
	titleContainer: {
		marginHorizontal: 12,
	},
});

export default memo(AssetPicker);
