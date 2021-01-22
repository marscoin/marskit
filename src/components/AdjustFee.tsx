import React, { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { EvilIcon, Text, TouchableOpacity, View } from '../styles/components';
import { systemWeights } from 'react-native-typography';

interface IButton {
	fee: number;
	decreaseFee: Function;
	increaseFee: Function;
}
const AdjustFee = ({
	fee = 1,
	decreaseFee = (): null => null,
	increaseFee = (): null => null,
}: IButton): ReactElement => {
	return (
		<View color="transparent" style={styles.feeRow}>
			<TouchableOpacity onPress={decreaseFee} style={styles.icon}>
				<EvilIcon type="text2" name={'minus'} size={42} />
			</TouchableOpacity>
			<View color="transparent" style={styles.fee}>
				<Text style={styles.title}>{fee} sats/byte</Text>
			</View>
			<TouchableOpacity onPress={increaseFee} style={styles.icon}>
				<EvilIcon name={'plus'} size={42} />
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	feeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginVertical: 5,
	},
	fee: {
		flex: 1.5,
	},
	icon: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 5,
		backgroundColor: 'transparent',
	},
	title: {
		...systemWeights.bold,
		fontSize: 16,
		textAlign: 'center',
		padding: 5,
	},
});

export default AdjustFee;
