import React, { PropsWithChildren, ReactElement, useCallback } from 'react';
import { StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { IActivityItem } from '../../store/types/activity';
import Divider from '../../components/Divider';
import { getFiatBalance, truncate } from '../../utils/helpers';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import { getBlockExplorerLink } from '../../utils/wallet/transactions';

interface SectionProps extends PropsWithChildren<any> {
	title: string;
	description?: string;
	value1: string;
	value2?: string;
	link?: string;
}

const Section = ({
	title,
	description,
	value1,
	value2,
	handleLink,
}: SectionProps): ReactElement => {
	const Col2 = ({ children }): ReactElement => {
		if (handleLink) {
			return (
				<TouchableOpacity onPress={handleLink}>{children}</TouchableOpacity>
			);
		}

		return <>{children}</>;
	};

	return (
		<View style={styles.sectionContent}>
			<View style={styles.sectionColumn1}>
				<Text>{title}</Text>
				{description ? <Text>{description}</Text> : null}
			</View>

			<Col2>
				<View style={styles.sectionColumn2}>
					<Text style={handleLink ? styles.linkText : {}}>{value1}</Text>
					{value2 ? <Text>{value2}</Text> : null}
				</View>
			</Col2>
		</View>
	);
};

interface Props extends PropsWithChildren<any> {
	route: { params: { activityItem: IActivityItem } };
}

const ActivityDetail = (props: Props): ReactElement => {
	const exchangeRate = useSelector((state: Store) => state.wallet.exchangeRate);
	const bitcoinUnit = useSelector((state: Store) => state.settings.bitcoinUnit);
	const selectedCurrency = useSelector(
		(state: Store) => state.settings.selectedCurrency,
	);

	const {
		activityItem: {
			id,
			message,
			activityType,
			txType,
			value,
			confirmed,
			fee,
			timestamp,
		},
	} = props.route.params;

	let status = '';
	if (value < 0) {
		if (confirmed) {
			status = 'Sent';
		} else {
			status = 'Sending...';
		}
	} else {
		if (confirmed) {
			status = 'Received';
		} else {
			status = 'Receiving...';
		}
	}

	const fiatBalance = getFiatBalance({
		balance: value,
		exchangeRate,
		selectedCurrency,
	});

	const fiatFee = getFiatBalance({
		balance: Number(fee),
		exchangeRate,
		selectedCurrency,
	});

	const blockExplorerUrl =
		activityType === 'onChain' ? getBlockExplorerLink(id) : '';

	const handleBlockExplorerOpen = useCallback(async () => {
		if (await Linking.canOpenURL(blockExplorerUrl)) {
			await Linking.openURL(blockExplorerUrl);
		}
	}, [blockExplorerUrl]);

	return (
		<View style={styles.container}>
			<NavigationHeader />
			<View style={styles.content}>
				<View>
					<Text style={styles.title}>Transaction detail</Text>
					<Divider />
					<Section
						title={status}
						description={confirmed ? 'Confirmed' : 'Unconfirmed'}
						value1={new Date(timestamp).toLocaleString()}
					/>
					<Divider />
					<Section
						title={'Amount'}
						value1={`${value} sats`}
						value2={`${fiatBalance} ${selectedCurrency}`}
					/>

					{fee && txType === 'sent' ? (
						<>
							<Divider />
							<Section
								title={'Fees'}
								value1={`${fee} sats`}
								value2={`${fiatFee} ${selectedCurrency}`}
							/>
						</>
					) : null}
				</View>

				<View style={styles.footer}>
					<Divider />

					<Section
						title={'Transaction ID'}
						value1={truncate(id, 16)}
						handleLink={blockExplorerUrl ? handleBlockExplorerOpen : undefined}
					/>
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
		paddingLeft: 20,
		paddingRight: 20,

		flex: 1,

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	footer: {
		paddingBottom: 20,
	},
	title: {
		fontSize: 21,
	},
	sectionContent: {
		display: 'flex',
		justifyContent: 'space-between',
		flexDirection: 'row',
		minHeight: 60,
		paddingVertical: 6,
	},
	sectionColumn1: {
		flex: 4,
		display: 'flex',
		justifyContent: 'space-around',
	},
	sectionColumn2: {
		flex: 5,
		display: 'flex',
		justifyContent: 'space-around',
		alignItems: 'flex-end',
	},
	linkText: {
		color: '#2D9CDB',
	},
});

export default ActivityDetail;
