import React, { ReactElement, memo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import {
	Caption13Up,
	Caption13M,
	View as ThemedView,
} from '../../../styles/components';
import SafeAreaInsets from '../../../components/SafeAreaInsets';
import Button from '../../../components/Button';
import NavigationHeader from '../../../components/NavigationHeader';
import LightningChannel from '../../../components/LightningChannel';
import Money from '../../../components/Money';

const Section = ({
	name,
	value,
}: {
	name: string;
	value: ReactElement;
}): ReactElement => {
	return (
		<View style={styles.sectionRoot}>
			<Caption13M>{name}</Caption13M>
			{value}
		</View>
	);
};

const ConnectionDetails = ({ route, navigation }): ReactElement => {
	const { node } = route.params;

	return (
		<ThemedView style={styles.root}>
			<SafeAreaInsets type="top" />
			<NavigationHeader title={node.name} />
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.channel}>
					<LightningChannel
						spendingTotal={node.spendingTotal}
						spendingAvailable={node.spendingAvailable}
						receivingTotal={node.receivingTotal}
						receivingAvailable={node.receivingAvailable}
					/>
				</View>

				<View style={styles.sectionTitle}>
					<Caption13Up color="gray1">BALANCE</Caption13Up>
				</View>
				<Section
					name="Receiving capacity"
					value={
						<Money
							sats={100500}
							size="caption13M"
							symbol={true}
							color="white"
							unit="satoshi"
						/>
					}
				/>
				<Section
					name="Spending balance"
					value={
						<Money
							sats={100500}
							size="caption13M"
							symbol={true}
							color="white"
							unit="satoshi"
						/>
					}
				/>
				<Section
					name="Unsettled"
					value={
						<Money
							sats={100500}
							size="caption13M"
							symbol={true}
							color="white"
							unit="satoshi"
							sign="+"
						/>
					}
				/>
				<Section
					name="Total channel size"
					value={
						<Money
							sats={100500}
							size="caption13M"
							symbol={true}
							color="white"
							unit="satoshi"
						/>
					}
				/>

				<View style={styles.sectionTitle}>
					<Caption13Up color="gray1">FEES</Caption13Up>
				</View>
				<Section
					name="Spending base fee"
					value={
						<Money
							sats={1}
							size="caption13M"
							symbol={true}
							color="white"
							unit="satoshi"
						/>
					}
				/>
				<Section
					name="Receiving base fee"
					value={
						<Money
							sats={1}
							size="caption13M"
							symbol={true}
							color="white"
							unit="satoshi"
						/>
					}
				/>

				<View style={styles.sectionTitle}>
					<Caption13Up color="gray1">FEES</Caption13Up>
				</View>
				<Section
					name="Opened on"
					value={<Caption13M>May 26, 2022 - 12:16</Caption13M>}
				/>
				<Section
					name="Node ID"
					value={<Caption13M>0296b2db..d73bf5c9</Caption13M>}
				/>

				<View style={styles.buttons}>
					<Button
						style={styles.button}
						text="Close Connection"
						size="large"
						onPress={(): void =>
							navigation.navigate('LightningCloseConnection')
						}
					/>
					<SafeAreaInsets type="bottom" />
				</View>
			</ScrollView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		justifyContent: 'space-between',
	},
	content: {
		paddingHorizontal: 16,
		flexGrow: 1,
	},
	channel: {
		paddingTop: 16,
		paddingBottom: 32,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
	},
	buttons: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	button: {
		marginTop: 8,
	},
	sectionTitle: {
		height: 50,
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
	},
	sectionRoot: {
		height: 50,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
	},
});

export default memo(ConnectionDetails);
