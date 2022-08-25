import React, { memo, ReactElement, useCallback } from 'react';
import { StyleSheet, Keyboard } from 'react-native';

import { Display, Pressable, LightningIcon } from '../../../styles/components';
import { toggleView } from '../../../store/actions/user';
import { useTransactionDetails } from '../../../hooks/transaction';

const FeeCustomToggle = ({ style }: { style?: object }): ReactElement => {
	const transaction = useTransactionDetails();

	const onTogglePress = useCallback(() => {
		Keyboard.dismiss(); // in case it was opened by Address input
		toggleView({
			view: 'numberPadFee',
			data: {
				isOpen: true,
				snapPoint: 0,
			},
		});
	}, []);

	return (
		<Pressable onPress={onTogglePress} style={[styles.row, style]}>
			<LightningIcon height={38} style={styles.symbol} color="gray2" />
			<Display>{transaction.satsPerByte}</Display>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	symbol: {
		marginRight: 4,
	},
});

export default memo(FeeCustomToggle);
