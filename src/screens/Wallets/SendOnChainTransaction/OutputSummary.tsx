import { IOutput } from '../../../store/types/wallet';
import React, { ReactElement } from 'react';
import { Text, View } from '../../../styles/components';
import { StyleSheet } from 'react-native';

const OutputSummary = ({
	outputs = [],
	changeAddress = '',
	lightning = false,
	children = <></>,
}: {
	outputs: IOutput[];
	changeAddress: string;
	lightning?: boolean;
	children?: ReactElement;
}): ReactElement => {
	return (
		<View color="transparent">
			{outputs &&
				outputs.map(({ address, value }, index) => {
					if (changeAddress !== address) {
						return (
							<View key={`${index}${value}`} color="transparent">
								{!lightning && (
									<>
										<Text style={styles.addressText}>Address:</Text>
										<Text style={styles.addressText}>{address}</Text>
									</>
								)}
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
