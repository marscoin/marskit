import React, {
	memo,
	ReactElement,
	useCallback,
	useMemo,
	useState,
} from 'react';
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
import { SvgXml } from 'react-native-svg';
import { switchIcon } from '../assets/icons/wallet';

const switchIconXml = switchIcon();

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
 * Displays the total available balance for the current wallet & network.
 */
const BalanceToggle = ({
	sats = 0,
	initialPrimary = 'fiat',
}: {
	sats: number;
	initialPrimary?: 'fiat' | 'asset';
}): ReactElement => {
	const [primary, setPrimary] = useState(initialPrimary);
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
		setPrimary(primary === 'asset' ? 'fiat' : 'asset');
	}, [primary]);

	return (
		<Pressable onPress={onTogglePress} style={styles.row}>
			<View color="transparent">{BalanceComponents}</View>
			<View style={styles.switchIcon}>
				<SvgXml xml={switchIconXml} width={15.44} height={12.22} />
			</View>
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
	switchIcon: {
		backgroundColor: 'rgba(37, 39, 43, 0.92);',
		borderRadius: 100,
		height: 35,
		width: 35,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		right: 20,
	},
});

export default memo(BalanceToggle);
