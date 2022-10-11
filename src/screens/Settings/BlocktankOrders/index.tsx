import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import SettingsView from '../SettingsView';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { IListData } from '../../../components/List';

const BlocktankOrders = ({ navigation }): ReactElement => {
	const blocktankOrders = useSelector((state: Store) => state.blocktank.orders);

	const [blocktankOrderList, setBlocktankOrderList] = useState<IListData[]>([]);

	const setupBlocktankOrderList = useCallback(async (): Promise<void> => {
		let listData: IListData = {
			title: 'Orders',
			data: [],
		};
		await Promise.all(
			blocktankOrders.map((blocktankOrder) => {
				const createdAt = new Date(blocktankOrder.created_at).toLocaleString(
					undefined,
					{
						year: 'numeric',
						month: 'long',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
					},
				);
				const onPress = (): void => {
					navigation.push('BlocktankOrderDetails', {
						blocktankOrder,
					});
				};
				listData.data.push({
					title: createdAt,
					description: blocktankOrder._id,
					value: blocktankOrder.stateMessage,
					type: 'textButton',
					onPress,
					hide: false,
				});
			}),
		);
		setBlocktankOrderList([listData]);
	}, [blocktankOrders, navigation]);

	useEffect(() => {
		setupBlocktankOrderList().then();
	}, [setupBlocktankOrderList]);

	return (
		<View style={styles.container}>
			<SettingsView
				title={'Blocktank Orders'}
				listData={blocktankOrderList}
				showBackNavigation={true}
				fullHeight={false}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
	},
});

export default memo(BlocktankOrders);
