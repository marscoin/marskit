import React, { PropsWithChildren, ReactElement } from 'react';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { StyleSheet } from 'react-native';
import { IActivityItem } from '../../store/types/activity';

interface Props extends PropsWithChildren<any> {
	route: { params: { activityItem: IActivityItem } };
}

const ActivityDetail = (props: Props): ReactElement => {
	const {
		activityItem: { id, message, activityType, txType, value, confirmed, fee },
	} = props.route.params;

	return (
		<View style={styles.container}>
			<NavigationHeader title={'Transaction Info'} />
			<View style={styles.content}>
				<Text>{id}</Text>
				<Text>
					Type: {activityType} {txType}
				</Text>
				<Text>Message: {message}</Text>
				<Text>Value: {value}</Text>
				<Text>Confirmed: {confirmed ? '✅' : '⌛'}</Text>
				{fee ? <Text>Fee: {fee}</Text> : null}
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
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default ActivityDetail;
