import React, { memo, ReactElement } from 'react';
import { StyleSheet } from 'react-native';

import {
	Caption13M,
	ReceiveIcon,
	SendIcon,
	Text01M,
	TouchableOpacity,
	View,
} from '../../styles/components';
import { IActivityItem } from '../../store/types/activity';
import useDisplayValues from '../../hooks/displayValues';

const ListItem = memo(
	({
		item,
		onPress,
	}: {
		item: IActivityItem & { formattedDate: string };
		onPress: () => void;
	}): ReactElement => {
		const { value, txType, confirmed, formattedDate } = item;

		const { bitcoinFormatted, bitcoinSymbol, fiatFormatted, fiatSymbol } =
			useDisplayValues(value);

		return (
			<TouchableOpacity style={styles.item} onPress={onPress}>
				<View style={styles.col1} color={'transparent'}>
					<View
						color={txType === 'sent' ? 'red16' : 'green16'}
						style={styles.iconCircle}>
						{txType === 'sent' ? (
							<SendIcon height={13} color="red" />
						) : (
							<ReceiveIcon height={13} color="green" />
						)}
					</View>
					<View color={'transparent'}>
						<Text01M>
							{txType === 'sent' ? 'Sent' : 'Received'}{' '}
							{!confirmed ? '(Unconfirmed)' : ''}
						</Text01M>
						<Caption13M color={'gray1'} style={styles.date} numberOfLines={1}>
							{formattedDate}
						</Caption13M>
					</View>
				</View>
				<View style={styles.col2} color={'transparent'}>
					<Text01M style={styles.value}>
						<Text01M color={'gray1'}>
							{txType === 'sent' ? '-' : '+'} {bitcoinSymbol}{' '}
						</Text01M>
						{bitcoinFormatted.replace('-', '')}
					</Text01M>
					<Caption13M color={'gray1'} style={styles.value}>
						{fiatSymbol} {fiatFormatted.replace('-', '')}
					</Caption13M>
				</View>
			</TouchableOpacity>
		);
	},
);

const styles = StyleSheet.create({
	content: {
		paddingTop: 20,
		paddingBottom: 100,
	},
	category: {
		marginBottom: 16,
	},
	item: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: 'transparent',
		marginBottom: 16,
	},
	col1: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		flex: 5,
	},
	col2: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-end',
		flex: 3,
	},
	iconCircle: {
		borderRadius: 20,
		width: 32,
		height: 32,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 14,
	},
	value: {
		textAlign: 'right',
	},
	date: {
		marginTop: 4,
		overflow: 'hidden',
	},
	header: {
		marginBottom: 23,
	},
	footer: {},
});

export default memo(ListItem);
