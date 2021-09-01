import React, { memo, PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import {
	Headline,
	Title,
	Text,
	Caption13M,
	View,
} from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import useDisplayValues from '../../utils/exchange-rate/useDisplayValues';
import { useBalance } from './SendOnChainTransaction/WalletHook';

interface Props extends PropsWithChildren<any> {
	route: {
		params: {
			walletType: 'bitcoin' | 'omnibolt';
		};
	};
	navigation: any;
}

const WalletsDetail = (props: Props): ReactElement => {
	const { route, navigation } = props;

	const {
		bitcoinFormatted,
		bitcoinSymbol,
		bitcoinTicker,
		fiatFormatted,
		fiatSymbol,
		fiatTicker,
	} = useBalance({ onchain: true, lightning: true });

	return (
		<View style={styles.container}>
			<NavigationHeader title="Wallets Detail" />
			<View style={styles.content}>
				<Headline>Bitcoin</Headline>
				<View style={styles.balanceContainer}>
					<Title>
						{fiatSymbol}
						{fiatFormatted}
					</Title>
					<Caption13M>
						{bitcoinFormatted} {bitcoinTicker}
					</Caption13M>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	balanceContainer: {
		marginVertical: 28,
	},
});

export default memo(WalletsDetail);
