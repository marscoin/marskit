import React, { ReactElement, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, MagnifyingGlassIcon } from '../styles/components';

const SearchInput = ({ style, children, ...props }): ReactElement => {
	const rootStyle = StyleSheet.compose(style, styles.root);

	return (
		<View style={rootStyle}>
			<MagnifyingGlassIcon style={styles.icon} />
			<TextInput style={styles.input} placeholder="Search" {...props} />
			{children && <View style={styles.tags}>{children}</View>}
		</View>
	);
};

const styles = StyleSheet.create({
	root: {
		position: 'relative',
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 32,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		overflow: 'hidden',
	},
	input: {
		height: 56,
		fontSize: 17,
		flex: 1,
		backgroundColor: 'transparent',
	},
	icon: {
		marginHorizontal: 16,
	},
	tags: {
		maxWidth: '60%',
	},
});

export default memo(SearchInput);
