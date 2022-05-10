import React, { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, MagnifyingGlassIcon } from '../styles/components';

const SearchInput = ({ style, ...props }): ReactElement => {
	return (
		<View style={StyleSheet.compose(style, styles.inputWrapper)}>
			<TextInput style={styles.input} placeholder="Search" {...props} />
			<View style={styles.iconContainer}>
				<MagnifyingGlassIcon style={styles.icon} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	inputWrapper: {
		position: 'relative',
	},
	input: {
		height: 56,
		paddingLeft: 53,
		borderRadius: 32,
		paddingRight: 6,
		fontSize: 17,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
	},
	iconContainer: {
		position: 'absolute',
		top: 0,
		left: 18,
		bottom: 0,
		justifyContent: 'center',
		flexDirection: 'row',
		alignItems: 'center',
	},
	icon: {
		marginRight: 16,
	},
});

export default SearchInput;
