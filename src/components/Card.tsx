import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../styles/components';

interface ICard {
	style?: {};
	children?: ReactNode;
}
const Card = ({ style = {}, children = {} }: ICard) => (
	<View color="surface" style={[styles.container, { style }]}>
		{children}
	</View>
);

const styles = StyleSheet.create({
	container: {
		width: '90%',
		minHeight: '10%',
		alignSelf: 'center',
		borderRadius: 15,
		marginVertical: 10,
		paddingVertical: 10,
		paddingHorizontal: 20,
		shadowColor: 'rgba(0, 0, 0, 0.1)',
		shadowOpacity: 0.9,
		elevation: 6,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 0 },
	},
});

export default Card;
