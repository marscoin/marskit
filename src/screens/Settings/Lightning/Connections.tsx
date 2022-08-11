import React, { ReactElement, memo, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';

import {
	AnimatedView,
	Caption13Up,
	ChevronRight,
	DownArrow,
	Text01M,
	UpArrow,
	View as ThemedView,
} from '../../../styles/components';
import SafeAreaInsets from '../../../components/SafeAreaInsets';
import Button from '../../../components/Button';
import NavigationHeader from '../../../components/NavigationHeader';
import LightningChannel from '../../../components/LightningChannel';
import Money from '../../../components/Money';
import useColors from '../../../hooks/colors';

const Node = ({
	name,
	spendingTotal,
	spendingAvailable,
	receivingTotal,
	receivingAvailable,
	disabled,
	onPress,
}): ReactElement => {
	return (
		<TouchableOpacity onPress={onPress} style={styles.nRoot}>
			<View style={styles.nTitle}>
				<Text01M>{name}</Text01M>
				<ChevronRight color="gray1" />
			</View>
			<LightningChannel
				spendingTotal={spendingTotal}
				spendingAvailable={spendingAvailable}
				receivingTotal={receivingTotal}
				receivingAvailable={receivingAvailable}
				disabled={disabled}
			/>
		</TouchableOpacity>
	);
};

const nodes = [
	{
		id: 1,
		name: 'Custom Node #4',
		status: 'pending',
		spendingTotal: 100,
		spendingAvailable: 30,
		receivingTotal: 100,
		receivingAvailable: 30,
		disabled: true,
	},
	{
		id: 2,
		name: 'Blocktank Lightning Node',
		status: 'connected',
		spendingTotal: 100,
		spendingAvailable: 30,
		receivingTotal: 100,
		receivingAvailable: 30,
		disabled: false,
	},
	{
		id: 3,
		name: 'Thor Lightning Node',
		status: 'connected',
		spendingTotal: 100,
		spendingAvailable: 30,
		receivingTotal: 100,
		receivingAvailable: 30,
		disabled: false,
	},
	{
		id: 4,
		name: 'LNBIG Lightning Node 1',
		status: 'closed',
		spendingTotal: 100,
		spendingAvailable: 30,
		receivingTotal: 100,
		receivingAvailable: 30,
		disabled: true,
	},
	{
		id: 5,
		name: 'LNBIG Lightning Node 3',
		status: 'closed',
		spendingTotal: 100,
		spendingAvailable: 30,
		receivingTotal: 100,
		receivingAvailable: 30,
		disabled: true,
	},
	{
		id: 6,
		name: 'Bluewallet',
		status: 'closed',
		spendingTotal: 100,
		spendingAvailable: 30,
		receivingTotal: 100,
		receivingAvailable: 30,
		disabled: true,
	},
];

const Connections = ({ navigation }): ReactElement => {
	const [closed, setClosed] = useState<boolean>(false);
	const colors = useColors();

	const handleAdd = (): void => {
		navigation.navigate('LightningAddConnection');
	};

	const handleNode = (node): void => {
		navigation.navigate('LightningConnection', { node });
	};

	return (
		<ThemedView style={styles.root}>
			<SafeAreaInsets type="top" />
			<NavigationHeader title="Lightning connections" onAddPress={handleAdd} />
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.balances}>
					<View style={styles.balance}>
						<Caption13Up color="gray1">Spending balance</Caption13Up>
						<View style={styles.row}>
							<UpArrow color="purple" width={22} height={22} />
							<Money sats={123321} color="purple" size="title" unit="satoshi" />
						</View>
					</View>
					<View style={styles.balance}>
						<Caption13Up color="gray1">Receiving capacity</Caption13Up>
						<View style={styles.row}>
							<DownArrow color="white" width={22} height={22} />
							<Money sats={123321} color="white" size="title" unit="satoshi" />
						</View>
					</View>
				</View>

				<Caption13Up color="gray1" style={styles.sectionTitle}>
					PENDING CONNECTIONS
				</Caption13Up>
				{nodes
					.filter(({ status }) => status === 'pending')
					.map((props) => (
						<Node
							{...props}
							key={props.id}
							onPress={(): void => handleNode(props)}
						/>
					))}

				<Caption13Up color="gray1" style={styles.sectionTitle}>
					OPEN CONNECTIONS
				</Caption13Up>
				{nodes
					.filter(({ status }) => status === 'connected')
					.map((props) => (
						<Node
							{...props}
							key={props.id}
							onPress={(): void => handleNode(props)}
						/>
					))}

				{closed && (
					<AnimatedView entering={FadeIn} exiting={FadeOut}>
						<Caption13Up color="gray1" style={styles.sectionTitle}>
							Closed connections
						</Caption13Up>
						{nodes
							.filter(({ status }) => status === 'closed')
							.map((props) => (
								<Node
									{...props}
									key={props.id}
									onPress={(): void => handleNode(props)}
								/>
							))}
					</AnimatedView>
				)}

				<View style={styles.buttons}>
					{!closed && (
						<Button
							style={styles.button}
							text="Show Closed Connections"
							textStyle={{ color: colors.white8 }}
							size="large"
							variant="transparent"
							onPress={(): void => setClosed((c) => !c)}
						/>
					)}
					<Button
						style={styles.button}
						text="Add New Connection"
						size="large"
						onPress={handleAdd}
					/>
				</View>
			</ScrollView>
			<SafeAreaInsets type="bottom" />
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
	balances: {
		flexDirection: 'row',
	},
	balance: {
		flex: 1,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
	},
	row: {
		marginTop: 8,
		flexDirection: 'row',
		alignItems: 'center',
	},
	buttons: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	button: {
		marginTop: 8,
	},
	sectionTitle: {
		marginTop: 16,
	},
	nRoot: {
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
	},
	nTitle: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 16,
		marginBottom: 8,
	},
});

export default memo(Connections);
