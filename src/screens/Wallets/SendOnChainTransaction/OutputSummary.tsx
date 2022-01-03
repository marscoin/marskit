import { IOutput } from '../../../store/types/wallet';
import React, { ReactElement } from 'react';
import { Text, View } from '../../../styles/components';
import { StyleSheet } from 'react-native';

const OutputSummary = ({
	outputs = [],
	changeAddress = '',
	children = <></>,
}: {
	outputs: IOutput[];
	changeAddress: string;
	children?: ReactElement;
}): ReactElement => {
	return (
		<View color="transparent">
			{outputs &&
				outputs.map(({ address = ' ', value }, index) => {
					if (changeAddress !== address) {
						return (
							<View key={`${index}${value}`} color="transparent">
								<Text style={styles.addressText}>Address:</Text>
								<Text style={styles.addressText}>{address}</Text>
							</View>
						);
					}
				})}
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	addressText: {
		textAlign: 'center',
	},
});

export default OutputSummary;
