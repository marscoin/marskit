import React, { memo, ReactElement } from 'react';
import Lightning from '../../../assets/icons/lightning-purple.svg';
import { EFeeIds } from '../../../store/types/fees';
import { Text } from '../../../styles/components';
import { StyleSheet } from 'react-native';

const FeePickerIcon = ({ id }: { id: EFeeIds }): ReactElement | null => {
	switch (id) {
		case 'instant':
			return <Lightning height={20} width={20} />;
		case 'fast':
			return <Text style={styles.icon}>🏎️</Text>;
		case 'normal':
			return <Text style={styles.icon}>🚗</Text>;
		case 'slow':
			return <Text style={styles.icon}>🐢</Text>;
		case 'custom':
			return <Text style={styles.icon}>⚙️</Text>;
		default:
			return null;
	}
};

export default memo(FeePickerIcon);

const styles = StyleSheet.create({
	icon: {
		fontSize: 14,
	},
});
