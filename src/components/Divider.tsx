import React, { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import Store from '../store/types';
import themes from '../styles/themes';

interface Props extends PropsWithChildren<any> {
	style?: {};
}

const Divider = ({ style }: Props = { style: {} }): ReactElement => {
	const settings = useSelector((state: Store) => state.settings);
	const theme = themes[settings.theme];

	return (
		<View
			style={[
				styles.line,
				{ backgroundColor: theme.colors.onBackground },
				style,
			]}
		/>
	);
};

const styles = StyleSheet.create({
	line: {
		height: 0.5,
		marginTop: 10,
		marginBottom: 10,
	},
});

export default Divider;
