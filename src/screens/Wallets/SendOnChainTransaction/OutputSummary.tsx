import { IOutput } from '../../../store/types/wallet';
import React, { ReactElement } from 'react';
import { Text, View } from '../../../styles/components';
import Summary from './Summary';
import { StyleSheet } from 'react-native';

const OutputSummary = ({
	outputs = [],
	changeAddress = '',
	sendAmount = 0,
	fee = 0,
}: {
	outputs: IOutput[];
	changeAddress: string;
	sendAmount: number;
	fee: number;
}): ReactElement => {
	return (
		<>
			{outputs &&
				outputs.map(({ address, value }, index) => {
					if (changeAddress !== address) {
						return (
							<View
								key={`${index}${value}`}
								color="transparent"
								style={styles.summaryContainer}>
								<View color="transparent" style={styles.summary}>
									<Text style={styles.addressText}>Address:</Text>
									<Text style={styles.addressText}>{address}</Text>
									<Summary
										leftText={'Send:'}
										rightText={`${sendAmount} sats`}
									/>
									<Summary leftText={'Fee:'} rightText={`${fee} sats`} />
								</View>
							</View>
						);
					}
				})}
		</>
	);
};

const styles = StyleSheet.create({
	addressText: {
		textAlign: 'center',
	},
	summary: {
		marginVertical: 20,
	},
	summaryContainer: {
		marginVertical: 5,
	},
});

export default OutputSummary;
