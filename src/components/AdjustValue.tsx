import React, { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { EvilIcon, Text, TouchableOpacity, View } from '../styles/components';
import { systemWeights } from 'react-native-typography';

interface IButton {
	value: number | string;
	decreaseValue: Function;
	increaseValue: Function;
}
const AdjustValue = ({
	value = 1,
	decreaseValue = (): null => null,
	increaseValue = (): null => null,
}: IButton): ReactElement => {
	return (
		<View color="transparent" style={styles.feeRow}>
			<TouchableOpacity onPress={decreaseValue} style={styles.icon}>
				<EvilIcon type="text2" name={'minus'} size={42} />
			</TouchableOpacity>
			<View color="transparent" style={styles.fee}>
				<Text style={styles.title}>{value}</Text>
			</View>
			<TouchableOpacity onPress={increaseValue} style={styles.icon}>
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

export default AdjustValue;
