import React, { memo, ReactElement, useState, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { AnimatedView } from '../../../styles/components';
import { Text02S } from '../../../styles/text';
import useColors from '../../../hooks/colors';
import { getKeychainValue, vibrate } from '../../../utils/helpers';
import { showBottomSheet } from '../../../store/actions/ui';
import NumberPad from '../../../components/NumberPad';

const SendPinPad = ({ onSuccess }: { onSuccess: () => void }): ReactElement => {
	const { t } = useTranslation('security');
	const [pin, setPin] = useState('');
	const [wrongPin, setWrongPin] = useState(false);
	const { brand, brand08 } = useColors();

	const handleOnPress = (key: string): void => {
		if (key === 'delete') {
			if (pin.length !== 0) {
				vibrate();
				setPin((p) => p.slice(0, -1));
			}
		} else {
			if (pin.length !== 4) {
				vibrate();
				setPin((p) => p + key);
			}
		}
	};

	// submit pin
	useEffect(() => {
		const timer = setTimeout(async () => {
			if (pin.length !== 4) {
				return;
			}

			const realPIN = await getKeychainValue({ key: 'pin' });

			// error getting pin
			if (realPIN.error) {
				vibrate();
				setPin('');
				return;
			}

			// incorrect pin
			if (pin !== realPIN?.data) {
				vibrate();
				setWrongPin(true);
				setPin('');
				return;
			}

			setPin('');
			onSuccess();
		}, 500);

		return (): void => {
			clearInterval(timer);
		};
	}, [pin, onSuccess]);

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				{wrongPin && (
					<AnimatedView
						style={styles.forgotPin}
						color="transparent"
						entering={FadeIn}
						exiting={FadeOut}>
						<Pressable
							onPress={(): void => {
								showBottomSheet('forgotPIN');
							}}>
							<Text02S color="brand">{t('cp_forgot')}</Text02S>
						</Pressable>
					</AnimatedView>
				)}

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
					type="simple"
					onPress={handleOnPress}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		marginTop: 42,
		flex: 1,
	},
	forgotPin: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	dots: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 16,
		marginBottom: 32,
	},
	dot: {
		width: 20,
		height: 20,
		borderRadius: 10,
		marginHorizontal: 12,
		borderWidth: 1,
	},
	numberpad: {
		marginTop: 'auto',
		maxHeight: 350,
	},
});

export default memo(SendPinPad);
