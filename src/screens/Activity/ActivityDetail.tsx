import React, { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, Linking } from 'react-native';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { IActivityItem } from '../../store/types/activity';
import themes from '../../styles/themes';
import Divider from '../../components/Divider';
import { getFiatBalance, truncate } from '../../utils/helpers';
import { useSelector } from 'react-redux';
import Store from '../../store/types';

interface SectionProps extends PropsWithChildren<any> {
	title: string;
	description?: string;
	value1: string;
	value2?: string;
}

const Section = ({
	title,
	description,
	value1,
	value2,
}: SectionProps): ReactElement => {
	return (
		<View style={styles.sectionContent}>
			<View style={styles.sectionColumn1}>
				<Text>{title}</Text>
				{description ? <Text>{description}</Text> : null}
			</View>

			<View style={styles.sectionColumn2}>
				<Text>{value1}</Text>
				{value2 ? <Text>{value2}</Text> : null}
			</View>
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

	return (
		<View style={styles.container}>
			<NavigationHeader />
			<View style={styles.content}>
				<Text style={styles.title}>Transaction detail</Text>
				<Divider />
				<Section
					title={status}
					description={confirmed ? 'Confirmed' : 'Unconfirmed'}
					value1={new Date(timestamp).toLocaleString()}
				/>

				<Divider />

				<Section title={'Amount'} value1={`${value}`} value2={fiatBalance} />

				{/*<Text>*/}
				{/*	Type: {activityType} {txType}*/}
				{/*</Text>*/}
				{/*<Text>Message: {message}</Text>*/}
				{/*<Text>Value: {value}</Text>*/}
				{/*<Text>Confirmed: {confirmed ? '✅' : '⌛'}</Text>*/}
				{/*{fee ? <Text>Fee: {fee}</Text> : null}*/}
				<Divider />

				<Section title={'Transaction ID'} value1={truncate(id, 16)} />
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
	},
	title: {
		fontSize: 21,
	},
	sectionContent: {
		display: 'flex',
		justifyContent: 'space-between',
		flexDirection: 'row',
		minHeight: 60,
	},
	sectionColumn1: {
		flex: 4,
		display: 'flex',
		justifyContent: 'center',
	},
	sectionColumn2: {
		flex: 5,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'flex-end',
	},
});

export default ActivityDetail;
