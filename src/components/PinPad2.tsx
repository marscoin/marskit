import React, {
	memo,
	ReactElement,
	useState,
	useEffect,
	useCallback,
} from 'react';
import { Alert, StyleSheet, View, LayoutAnimation } from 'react-native';

import { View as ThemedView, Text01S, Subtitle } from '../styles/components';
import NumberPad from './NumberPad';
import SafeAreaInsets from './SafeAreaInsets';
import useColors from '../hooks/colors';
import { wipeWallet } from '../store/actions/settings';
import { setKeychainValue, getKeychainValue, vibrate } from '../utils/helpers';

export const PIN_ATTEMPTS = '10';

const ChoosePIN = ({ onSuccess }: { onSuccess: Function }): ReactElement => {
	const [pin, setPin] = useState<string>('');
	const [attemptsRemaining, setAttemptsRemaining] = useState(0);
	const { brand, brand08 } = useColors();

	const handleOnPress = (n): void => {
		vibrate({});
		setPin((p) => {
			if (p.length === 4) {
				return;
			}
			return p + String(n);
		});
	};

	const handleOnRemove = (): void => {
		vibrate({});
		setPin((p) => p.slice(0, -1));
	};

	const handleOnClear = (): void => {
		vibrate({});
		setPin('');
	};

	// Reduce the amount of pin attempts remaining.
	const reducePinAttemptsRemaining = useCallback(async (): Promise<void> => {
		const _attemptsRemaining = attemptsRemaining - 1;
		await setKeychainValue({
			key: 'pinAttemptsRemaining',
			value: `${_attemptsRemaining}`,
		});
		setAttemptsRemaining(_attemptsRemaining);
	}, [attemptsRemaining]);

	useEffect(() => LayoutAnimation.easeInEaseOut());

	// init view
	useEffect(() => {
		(async (): Promise<void> => {
			const attemptsRemainingResponse = await getKeychainValue({
				key: 'pinAttemptsRemaining',
			});
			if (
				!attemptsRemainingResponse.error &&
				Number(attemptsRemainingResponse.data) !== Number(attemptsRemaining)
			) {
				let numAttempts =
					attemptsRemainingResponse.data !== undefined
						? Number(attemptsRemainingResponse.data)
						: 5;
				setAttemptsRemaining(numAttempts);
			}
		})();
	}, [attemptsRemaining]);

	// submit pin
	useEffect(() => {
		const timer = setTimeout(async () => {
			if (pin.length !== 4) {
				return;
			}

			const realPIN = await getKeychainValue({ key: 'pin' });

			// error getting pin
			if (realPIN.error) {
				await reducePinAttemptsRemaining();
				vibrate({});
				setPin('');
				return;
			}

			// in correct pin
			if (pin !== realPIN?.data) {
				if (attemptsRemaining <= 1) {
					//Wipe device. Too many attempts
					console.log(
						'Pin attempt threshold breached. Wiping device. Hope you made a backup, friend.',
					);
					vibrate({ type: 'default' });
					await wipeWallet({});
					Alert.alert('All wallet data has been wiped');
				} else {
					await reducePinAttemptsRemaining();
				}

				vibrate({});
				setPin('');
				return;
			}

			// correct pin
			await setKeychainValue({
				key: 'pinAttemptsRemaining',
				value: PIN_ATTEMPTS,
			});
			setPin('');
			onSuccess?.();
		}, 500);
		return (): void => clearInterval(timer);
	}, [pin, attemptsRemaining, onSuccess, reducePinAttemptsRemaining]);

	return (
		<ThemedView color="onSurface" style={styles.container}>
			<SafeAreaInsets type="top" />
			<View>
				<Subtitle style={styles.title}>Enter pin</Subtitle>
				<Text01S style={styles.title} color="gray1">
					Attempts Remaining: {attemptsRemaining}
				</Text01S>
			</View>

			<View style={styles.dots}>
				{Array(4)
					.fill(null)
					.map((_, i) => (
						<View
							key={i}
							style={[
								styles.dot,
								{
									borderColor: brand,
									backgroundColor: pin[i] === undefined ? brand08 : brand,
								},
							]}
						/>
					))}
			</View>

			<NumberPad
				style={styles.numberpad}
				onPress={handleOnPress}
				onRemove={handleOnRemove}
				onClear={handleOnClear}
			/>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'space-between',
	},
	title: {
		textAlign: 'center',
		marginBottom: 32,
	},
	dots: {
		flexDirection: 'row',
		justifyContent: 'center',
		alighItems: 'center',
		marginVertical: 32,
	},
	dot: {
		width: 20,
		height: 20,
		borderRadius: 10,
		marginHorizontal: 12,
		borderWidth: 1,
	},
	numberpad: {
		maxHeight: 350,
	},
});

export default memo(ChoosePIN);
