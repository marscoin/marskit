import React, { memo, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { View, Pressable, Text02M, Caption13M } from '../styles/components';
import { IDisplayValues } from '../utils/exchange-rate/types';

const AssetCard = ({
	name,
	ticker,
	icon,
	balances,
	onPress,
}: {
	name: string;
	ticker: string;
	icon: ReactElement;
	balances: IDisplayValues;
	onPress: Function;
}): ReactElement => {
	return (
		<Pressable style={styles.container} onPress={onPress} color="transparent">
			<View color="transparent" style={styles.col1}>
				{icon}
				<View color="transparent" style={styles.titleContainer}>
					<Text02M>{name}</Text02M>
					<Caption13M color={'gray1'}>{ticker}</Caption13M>
				</View>
			</View>

			<View color="transparent" style={styles.col2}>
				<Text02M style={styles.value}>
					{balances.bitcoinSymbol}
					{balances.bitcoinFormatted}
				</Text02M>
				<Caption13M style={styles.value} color={'gray1'}>
					{balances.fiatSymbol}
					{balances.fiatFormatted}
				</Caption13M>
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	container: {
		minHeight: 88,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flexDirection: 'row',
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
		borderBottomWidth: 1,
	},
	col1: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flexDirection: 'row',
	},
	col2: {
		display: 'flex',
		alignContent: 'flex-end',
	},
	titleContainer: {
		marginHorizontal: 12,
	},
	value: {
		textAlign: 'right',
	},
});

export default memo(AssetCard);
