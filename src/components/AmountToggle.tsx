import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import {
	Display,
	Title,
	View,
	Pressable,
	Headline,
} from '../styles/components';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { abbreviateNumber } from '../utils/helpers';
import useDisplayValues from '../hooks/displayValues';
import { IDisplayValues } from '../utils/exchange-rate';
import { toggleView } from '../store/actions/user';
import { useSelector } from 'react-redux';
import Store from '../store/types';

const FiatBalance = memo(
	({
		displayValues,
		primary = true,
	}: {
		displayValues: IDisplayValues;
		primary: boolean;
	}): ReactElement => {
		LayoutAnimation.easeInEaseOut();
		const { fiatWhole, fiatDecimal, fiatDecimalValue, fiatTicker } =
			displayValues;
		const size = useMemo(() => (primary ? '34px' : '18px'), [primary]);
		if (fiatWhole.length > 12) {
			const { newValue, abbreviation } = abbreviateNumber(fiatWhole);
			return (
				<View style={styles.row}>
					<Headline size={size} color={primary ? null : 'gray'}>
						{newValue}
					</Headline>
					<Headline size={size} color="gray">
						{abbreviation}
					</Headline>
				</View>
			);
		}
		return (
			<View style={styles.row}>
				<Display size={size} color={primary ? null : 'gray'}>
					{fiatWhole}
					{fiatDecimal}
					{fiatDecimalValue}{' '}
				</Display>
				<Title size={size} color="gray">
					{fiatTicker}
				</Title>
			</View>
		);
	},
);

const AssetBalance = memo(
	({
		displayValues,
		primary = true,
	}: {
		displayValues: IDisplayValues;
		primary: boolean;
	}): ReactElement => {
		LayoutAnimation.easeInEaseOut();
		const size = useMemo(() => (primary ? '34px' : '18px'), [primary]);
		const { bitcoinFormatted, bitcoinTicker } = displayValues;
		return (
			<View style={styles.row} size={size}>
				<Headline size={size} color={primary ? null : 'gray'}>
					{bitcoinFormatted}
				</Headline>
				<Headline size={size} color="gray">
					{' '}
					{bitcoinTicker.toLowerCase()}
				</Headline>
			</View>
		);
	},
);

/**
 * Displays the total amount of sats specified and it's corresponding fiat value.
 */
const AmountToggle = ({
	sats = 0,
	style,
}: {
	sats: number;
	style?: object;
}): ReactElement => {
	const primary = useSelector((state: Store) => state.settings.unitPreference);
	const displayValues = useDisplayValues(sats);
	const fiatIsPrimary = useMemo(() => primary === 'fiat', [primary]);

	const getBalanceComponents = useCallback(() => {
		const arr: ReactElement[] = [
			<FiatBalance displayValues={displayValues} primary={fiatIsPrimary} />,
			<AssetBalance displayValues={displayValues} primary={!fiatIsPrimary} />,
		];
		if (!fiatIsPrimary) {
			[arr[0], arr[1]] = [arr[1], arr[0]];
		}
		return arr;
	}, [displayValues, fiatIsPrimary]);

	const BalanceComponents = useMemo(() => {
		return getBalanceComponents().map((Component, i) => (
			<View color="transparent" key={i}>
				{Component}
			</View>
		));
	}, [getBalanceComponents]);
	const onTogglePress = useCallback(() => {
		toggleView({
			view: 'numberPad',
			data: {
				isOpen: true,
				snapPoint: 0,
			},
		}).then();
	}, []);

	return (
		<Pressable onPress={onTogglePress} style={[styles.row, style]}>
			<View color="transparent">{BalanceComponents}</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
	},
});

export default memo(AmountToggle);
