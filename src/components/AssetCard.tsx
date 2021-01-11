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
}): ReactElement => {
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
							<View color="transparent" style={styles.labelsContainer}>
								<View color="transparent" style={styles.balanceLabelContainer}>
									<Text style={styles.balanceLabels}>{assetBalanceLabel}</Text>
								</View>
								<View color="transparent" style={styles.fiatLabelContainer}>
									<Text style={styles.balanceLabels}>{fiatBalanceLabel}</Text>
								</View>
							</View>
						</>
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
	labelsContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'flex-end',
	},
	balanceLabelContainer: {
		flex: 1,
	},
	balanceLabels: {
		marginBottom: 5,
	},
	col1: {
		flex: 0.6,
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	col2: {
		flex: 2,
	},
	fiatLabelContainer: {
		flex: 1,
		alignItems: 'flex-end',
		justifyContent: 'flex-end',
	},
	row: {
		flexDirection: 'row',
	},
});

export default memo(AssetCard);
