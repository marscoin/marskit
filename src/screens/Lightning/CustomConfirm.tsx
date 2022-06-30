import React, { ReactElement, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
	Caption13Up,
	Headline,
	DisplayHaas,
	Text01S,
	Text01M,
	LightningIcon,
} from '../../styles/components';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import GlowingBackground from '../../components/GlowingBackground';
import NavigationHeader from '../../components/NavigationHeader';
import SwipeToConfirm from '../../components/SwipeToConfirm';
import useColors from '../../hooks/colors';
import useDisplayValues from '../../hooks/displayValues';

const CustomConfirm = ({ navigation, route }): ReactElement => {
	const { spendingAmount, receivingAmount, receivingCost } = route.params;
	const spending = useDisplayValues(spendingAmount);
	const receiving = useDisplayValues(receivingAmount);
	const cost = useDisplayValues(receivingCost);
	const colors = useColors();
	const [loading, setLoading] = useState(false);

	const handleConfirm = (): void => {
		setLoading(true);
		navigation.navigate('Result');
	};

	return (
		<GlowingBackground topLeft={colors.purple}>
			<SafeAreaInsets type="top" />
			<NavigationHeader title="Add instant payments" />
			<View style={styles.root}>
				<View>
					<DisplayHaas color="purple">Please{'\n'}confirm.</DisplayHaas>
					<Text01S color="gray1" style={styles.text}>
						It costs{' '}
						<Text01S>
							{cost.fiatSymbol}
							{cost.fiatFormatted}
						</Text01S>{' '}
						to connect you and set up your balance. Your Lightning connection
						will stay open for at least
						<Text01S> 90</Text01S> days.
					</Text01S>

					<View style={styles.block}>
						<Caption13Up color="purple" style={styles.space}>
							SPENDING BALANCE
						</Caption13Up>
						<Headline style={styles.space}>
							<Headline color="gray2">{spending.bitcoinSymbol} </Headline>
							{spending.bitcoinFormatted}
						</Headline>
						<Text01M color="gray2" style={styles.space}>
							{spending.fiatSymbol} {spending.fiatFormatted}
						</Text01M>
					</View>

					<View style={styles.block}>
						<Caption13Up color="purple" style={styles.space}>
							RECEIVING BANDWIDTH
						</Caption13Up>
						<Headline style={styles.space}>
							<Headline color="gray2">{receiving.bitcoinSymbol} </Headline>
							{receiving.bitcoinFormatted}
						</Headline>
						<Text01M color="gray2" style={styles.space}>
							{receiving.fiatSymbol} {receiving.fiatFormatted}
						</Text01M>
					</View>
				</View>

				<View>
					<SwipeToConfirm
						text="Swipe to pay & connect"
						color="purple"
						onConfirm={handleConfirm}
						icon={<LightningIcon width={30} height={30} color="black" />}
						loading={loading}
						confirmed={loading}
					/>
					<SafeAreaInsets type="bottom" />
				</View>
			</View>
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		display: 'flex',
		justifyContent: 'space-between',
		marginTop: 8,
		paddingHorizontal: 16,
	},
	text: {
		marginTop: 16,
		marginBottom: 40,
	},
	space: {
		marginBottom: 8,
	},
	block: {
		borderColor: 'rgba(255, 255, 255, 0.1)',
		borderBottomWidth: 1,
		marginBottom: 16,
	},
});

export default CustomConfirm;
