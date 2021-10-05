import React, { memo, ReactElement } from 'react';
import {
	View,
	BitcoinCircleIcon,
	Text02M,
	Caption13M,
	EvilIcon,
} from '../styles/components';
import { StyleSheet } from 'react-native';
import { useBalance } from '../hooks/transaction';
import useDisplayValues from '../hooks/displayValues';
import Card from './Card';

const AssetPicker = (): ReactElement => {
	const sats = useBalance();
	const balances = useDisplayValues(sats);

	return (
		<Card style={styles.container} color={'gray336'}>
			<>
				<View style={styles.col1}>
					<BitcoinCircleIcon />
					<View color="transparent" style={styles.titleContainer}>
						<Text02M>Bitcoin</Text02M>
						<Caption13M color={'gray1'}>
							Balance: {balances.fiatSymbol}
							{balances.fiatFormatted}
						</Caption13M>
					</View>
				</View>

				<View color="transparent" style={styles.col2}>
					<EvilIcon name={'chevron-down'} size={30} color="onBackground" />
				</View>
			</>
		</Card>
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
