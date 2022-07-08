import React, { ReactElement, memo, useMemo, useCallback } from 'react';
import { StyleSheet, View, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { Caption13Up, View as ThemedView } from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';
import Button from '../../../components/Button';
import { useTransactionDetails } from '../../../hooks/transaction';
import { toggleView } from '../../../store/actions/user';
import FeeCustomToggle from './FeeCustomToggle';

const FeeRate = ({ navigation }): ReactElement => {
	const insets = useSafeAreaInsets();
	const nextButtonContainer = useMemo(
		() => ({
			...styles.nextButtonContainer,
			paddingBottom: insets.bottom + 10,
		}),
		[insets.bottom],
	);

	const transaction = useTransactionDetails();

	useFocusEffect(
		useCallback(() => {
			Keyboard.dismiss();
			toggleView({
				view: 'numberPadFee',
				data: {
					isOpen: true,
					snapPoint: 0,
				},
			});
			return (): void => {
				toggleView({
					view: 'numberPadFee',
					data: {
						isOpen: false,
					},
				});
			};
		}, []),
	);

	return (
		<ThemedView color="onSurface" style={styles.container}>
			<NavigationHeader
				displayBackButton={transaction.satsPerByte !== 0}
				title="Set custom fee"
				size="sm"
			/>
			<View style={styles.content}>
				<Caption13Up color="gray1" style={styles.title}>
					SAT / VBYTE
				</Caption13Up>
				<FeeCustomToggle />

				<View style={nextButtonContainer}>
					<Button
						size="lg"
						text="Done"
						disabled={transaction.satsPerByte === 0}
						onPress={(): void => navigation.goBack()}
					/>
				</View>
			</View>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		marginTop: 20,
		paddingHorizontal: 16,
	},
	title: {
		marginBottom: 16,
	},
	nextButtonContainer: {
		flex: 1,
		justifyContent: 'flex-end',
		paddingHorizontal: 16,
		minHeight: 100,
	},
});

export default memo(FeeRate);
