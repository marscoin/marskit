import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text01S, TextInput } from '../styles/components';

const SeedInput = forwardRef(({ index, ...props }: { index: number }, ref) => {
	return (
		<View style={styles.inputWrapper}>
			<TextInput
				ref={ref}
				style={styles.input}
				autoCapitalize="none"
				autoCorrect={false}
				{...props}
			/>
			<View style={styles.index}>
				{
					<Text01S color="brand" style={styles.indexText}>
						{index + 1}.
					</Text01S>
				}
			</View>
		</View>
	);
});

const styles = StyleSheet.create({
	inputWrapper: {
		width: '45%',
		position: 'relative',
		marginHorizontal: 2,
		marginBottom: 4,
		minWidth: 100,
		flexGrow: 1,
	},
	input: {
		height: 46,
		paddingLeft: 45,
		paddingRight: 6,
		borderRadius: 8,
		fontSize: 17,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
	},
	index: {
		position: 'absolute',
		top: 0,
		left: 16,
		bottom: 0,
		width: 30,
		justifyContent: 'center',
	},
	indexText: {
		justifyContent: 'center',
		fontWeight: 'bold',
	},
});

export default SeedInput;
