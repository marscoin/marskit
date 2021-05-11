/**
 * @format
 * @flow strict-local
 */

import React, { memo, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import BitcoinLogo from '../../assets/bitcoin-logo.svg';
import LightningLogo from '../../assets/lightning-logo.svg';
import { AnimatedView, Feather, View } from '../../styles/components';
import SendForm from '../../components/SendForm';
import Summary from './SendOnChainTransaction/Summary';
import Button from '../../components/Button';
import NavigationHeader from '../../components/NavigationHeader';
import SendOnChainTransaction from './SendOnChainTransaction';

const BitcoinToLightning = (): ReactElement => {
	return <SendOnChainTransaction header={true} />;

	// return (
	// 	<View color={'transparent'} style={styles.container}>
	// 		<View color={'transparent'} style={styles.header}>
	// 			<BitcoinLogo viewBox="0 0 70 70" height={65} width={65} />
	// 			{/*<Text style={styles.headerTitle}>Switch</Text>*/}
	// 			<Feather name={'arrow-right'} size={30} />
	// 			<LightningLogo viewBox="0 0 300 300" height={65} width={65} />
	// 		</View>
	// 		<SendOnChainTransaction header={false} />
	// 	</View>
	// );
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'green',
		flex: 1,
		paddingRight: 20,
		paddingLeft: 20,
		display: 'flex',
	},
	header: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginTop: 20,
	},
	headerTitle: {
		color: 'orange',
		fontSize: 20,
		textAlign: 'center',
	},
	formContainer: {},
	summary: {},
});

export default memo(BitcoinToLightning);
