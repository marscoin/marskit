import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { View as ThemedView, AnimatedView } from '../../../styles/components';
import { Text01S, Text02S } from '../../../styles/text';
import SafeAreaInset from '../../../components/SafeAreaInset';
import NavigationHeader from '../../../components/NavigationHeader';
import NumberPad from '../../../components/NumberPad';
import useColors from '../../../hooks/colors';
import { vibrate } from '../../../utils/helpers';
import type { SettingsScreenProps } from '../../../navigation/types';
import { editPin } from '../../../utils/settings';
import { FadeIn, FadeOut } from 'react-native-reanimated';

const ChangePin2 = ({
	navigation,
	route,
}: SettingsScreenProps<'ChangePin2'>): ReactElement => {
	const { t } = useTranslation('security');
	const origPIN = route.params?.pin;
	const [pin, setPin] = useState<string>('');
	const [wrongPin, setWrongPin] = useState<boolean>(false);
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

	// reset pin on back
	useFocusEffect(useCallback(() => setPin(''), []));

	// submit pin
	useEffect(() => {
		const timer = setTimeout(async () => {
			if (pin.length !== 4) {
				return;
			}
			if (!origPIN) {
				navigation.push('ChangePin2', { pin });
				return;
			}
			const pinsAreEqual = pin === origPIN;
			if (pinsAreEqual) {
				editPin(pin);
				navigation.navigate('PinChanged');
			} else {
				vibrate({ type: 'notificationWarning' });
				setPin('');
				setWrongPin(true);
			}
		}, 500);

		return (): void => clearInterval(timer);
	}, [pin, origPIN, navigation]);

	return (
		<ThemedView style={styles.container} testID="ChangePIN2">
			<SafeAreaInset type="top" />
			<NavigationHeader
				title={t(origPIN ? 'cp_retype_title' : 'cp_setnew_title')}
				onClosePress={(): void => {
					navigation.navigate('Wallet');
				}}
			/>

			<Text01S style={styles.text} color="gray1">
				{t(origPIN ? 'cp_retype_text' : 'cp_setnew_text')}
			</Text01S>

			<View style={styles.wrongPin}>
				{wrongPin ? (
					<AnimatedView
						color="transparent"
						entering={FadeIn}
						exiting={FadeOut}
						testID="WrongPIN">
						<Text02S color="brand">{t('cp_try_again')}</Text02S>
					</AnimatedView>
				) : (
					<Text02S> </Text02S>
				)}
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
				type="simple"
				onPress={handleOnPress}
			/>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	text: {
		alignSelf: 'flex-start',
		marginHorizontal: 16,
		marginBottom: 32,
	},
	wrongPin: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginBottom: 16,
	},
	dots: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginBottom: 'auto',
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

export default memo(ChangePin2);
