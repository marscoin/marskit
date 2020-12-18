/**
 * @format
 * @flow strict-local
 */

import React, { memo, ReactElement } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View, Text } from '../styles/components';
import Card from './Card';
import BitcoinLogo from '../assets/bitcoin-logo.svg';
import LightningLogo from '../assets/lightning-logo.svg';

const HeaderIcon = ({ id = 'bitcoin' }): ReactElement => {
	try {
		switch (id) {
			case 'bitcoin':
				return <BitcoinLogo viewBox="0 0 70 70" height={55} width={55} />;
			case 'lightning':
				return <LightningLogo viewBox="0 0 300 300" height={55} width={55} />;
			default:
				return <BitcoinLogo viewBox="0 0 70 70" height={55} width={55} />;
		}
	} catch {
		return <BitcoinLogo viewBox="0 0 70 70" height={55} width={55} />;
	}
};

const AssetCard = ({
	asset = 'bitcoin',
	title = 'Bitcoin Wallet',
	description = '',
	assetBalanceLabel = '0 BTC',
	fiatBalanceLabel = '$0',
	children = <View />,
}: {
	asset: string;
	title: string;
	description?: string;
	assetBalanceLabel: string;
	fiatBalanceLabel: string;
	children: ReactElement;
}) => {
	LayoutAnimation.easeInEaseOut();

	return (
		<Card>
			<>
				<View color="transparent" style={styles.row}>
					<View color="transparent" style={styles.col1}>
						<HeaderIcon id={asset} />
					</View>
					<View color="transparent" style={styles.col2}>
						<>
							<Text style={styles.title}>{title}</Text>
							{description ? (
								<Text style={styles.description}>{description}</Text>
							) : null}
						</>

						<View color="transparent" style={styles.assetBalanceContainer}>
							<Text style={styles.balanceLabels}>{assetBalanceLabel}</Text>
						</View>
					</View>
					<View color="transparent" style={styles.col3}>
						<Text style={styles.balanceLabels}>{fiatBalanceLabel}</Text>
					</View>
				</View>
				{children}
			</>
		</Card>
	);
};

const styles = StyleSheet.create({
	title: {
		fontWeight: 'bold',
		fontSize: 16,
	},
	description: {
		fontSize: 12,
	},
	balanceLabels: {
		marginBottom: 5,
	},
	assetBalanceContainer: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	col1: {
		flex: 0.6,
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	col2: {
		flex: 1.2,
	},
	col3: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
	},
	row: {
		flexDirection: 'row',
	},
});

export default memo(AssetCard);
