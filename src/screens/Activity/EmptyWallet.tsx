import React, { memo, ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { Headline } from '../../styles/components';
import Arrow from '../../assets/dotted-arrow.svg';

const EmptyWallet = (): ReactElement => {
	return (
		<View style={styles.root}>
			<Headline>
				To get started send <Headline color="brand">Bitcoin</Headline> to your
				wallet.
			</Headline>

			<View style={styles.arrowContainer}>
				<View style={styles.spaceLeft} />
				<Arrow />
				<View style={styles.spaceRight} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	root: {
		paddingHorizontal: 16,
		marginTop: '35%',
	},
	arrowContainer: {
		marginTop: 32,
		flexDirection: 'row',
	},
	spaceLeft: {
		flex: 6,
	},
	spaceRight: {
		flex: 3,
	},
});

export default memo(EmptyWallet);
