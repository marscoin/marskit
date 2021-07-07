import React, { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../styles/components';

interface Props extends PropsWithChildren<any> {
	style?: {};
}

const Divider = ({ style }: Props = { style: {} }): ReactElement => {
	return <View color={'onBackground'} style={[styles.line, style]} />;
};

const styles = StyleSheet.create({
	line: {
		height: 0.5,
		marginTop: 10,
		marginBottom: 10,
	},
});

export default Divider;
