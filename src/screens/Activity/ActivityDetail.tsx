import React, {
	PropsWithChildren,
	ReactElement,
	useCallback,
	useState,
} from 'react';
import { StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { EActivityTypes, IActivityItem } from '../../store/types/activity';
import Divider from '../../components/Divider';
import { truncate } from '../../utils/helpers';
import { getBlockExplorerLink } from '../../utils/wallet/transactions';
import useDisplayValues from '../../hooks/displayValues';
import SafeAreaView from '../../components/SafeAreaView';

interface SectionProps extends PropsWithChildren<any> {
	title: string;
	description?: string;
	value1: string;
	value2?: string;
	handleLink?: (event) => void;
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

const emptyActivityItem: IActivityItem = {
	id: '',
	message: '',
	address: '',
	activityType: EActivityTypes.onChain,
	txType: 'sent',
	value: 0,
	confirmed: false,
	fee: 0,
	timestamp: 0,
};

const ActivityDetail = (props: Props): ReactElement => {
	const [
		{
			id,
			message,
			address,
			activityType,
			txType,
			value,
			confirmed,
			fee,
			timestamp,
		},
		//setActivityItem,
	] = useState<IActivityItem>(
		props.route.params?.activityItem ?? emptyActivityItem,
	);

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

	const { bitcoinFormatted, bitcoinSymbol, fiatFormatted, fiatSymbol } =
		useDisplayValues(value);
	const feeDisplay = useDisplayValues(Number(fee));

	const blockExplorerUrl =
		activityType === 'onChain' ? getBlockExplorerLink(id) : '';

	const handleBlockExplorerOpen = useCallback(async () => {
		if (await Linking.canOpenURL(blockExplorerUrl)) {
			await Linking.openURL(blockExplorerUrl);
		}
	}, [blockExplorerUrl]);

	return (
		<SafeAreaView>
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
						value1={`${bitcoinSymbol}${bitcoinFormatted}`}
						value2={`${fiatSymbol}${fiatFormatted}`}
					/>

					{fee && txType === 'sent' ? (
						<>
							<Divider />
							<Section
								title={'Fees'}
								value1={`${feeDisplay.bitcoinSymbol}${feeDisplay.bitcoinFormatted}`}
								value2={`${feeDisplay.fiatSymbol}${feeDisplay.fiatFormatted}`}
							/>
						</>
					) : null}

					{message ? (
						<>
							<Divider />
							<Section title={'Message'} value1={message} />
						</>
					) : null}

					{address ? (
						<>
							<Divider />
							<Section title={'Address'} value1={address} />
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
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
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
