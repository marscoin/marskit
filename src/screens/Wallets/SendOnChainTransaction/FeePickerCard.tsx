import React, { memo, ReactElement, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
	AntDesign,
	EvilIcon,
	Text01M,
	Text01S,
	Text02M,
	Text02S,
	View,
} from '../../../styles/components';
import Card from '../../../components/Card';
import FeePickerIcon from './FeePickerIcon';
import useDisplayValues from '../../../hooks/displayValues';
import colors from '../../../styles/colors';
import { EFeeIds } from '../../../store/types/fees';
import { FeeText } from '../../../store/shapes/fees';

const NoneCard = memo(
	({ onPress = (): null => null }: { onPress?: Function }): ReactElement => {
		return (
			<Card onPress={onPress} style={styles.card} color={'gray336'}>
				<View color={'transparent'} style={styles.container}>
					<View style={styles.col1}>
						<View color="transparent" style={styles.titleContainer}>
							<Text02M>Speed</Text02M>
							<Text01S style={styles.speedText} size={14} color={'gray'}>
								<AntDesign name={'clockcircleo'} size={14} color="gray" />{' '}
								Select speed and fee
							</Text01S>
						</View>
					</View>

					<View color="transparent" style={styles.col2}>
						<EvilIcon name={'chevron-down'} size={30} color="onBackground" />
					</View>
				</View>
			</Card>
		);
	},
);

const FeePickerCard = ({
	id = EFeeIds.none,
	title,
	description,
	sats = 0,
	onPress,
	isSelected = false,
}: {
	id: EFeeIds;
	title?: string;
	description?: string;
	sats?: number;
	onPress?: Function;
	isSelected?: boolean;
}): ReactElement => {
	const totalFeeDisplay = useDisplayValues(sats);

	const _description = useMemo(() => {
		return description !== '' ? description : FeeText[id].description;
	}, [description, id]);

	if (id === EFeeIds.none) {
		return <NoneCard onPress={onPress} />;
	}

	return (
		<Card
			onPress={onPress}
			style={[
				styles.card,
				/*eslint-disable-next-line react-native/no-inline-styles*/
				{ borderColor: isSelected ? colors.orange : 'transparent' },
			]}
			color={'gray336'}>
			<View color="transparent" style={styles.icon}>
				<FeePickerIcon id={id} />
			</View>
			<View color="transparent" style={styles.description}>
				{title !== '' && <Text01M>{title}</Text01M>}
				{description !== '' && <Text02S>{_description}</Text02S>}
			</View>
			{sats > 0 ? (
				<View color="transparent" style={styles.sats}>
					<Text01M style={styles.title}>
						{totalFeeDisplay.fiatSymbol} {totalFeeDisplay.fiatFormatted}
					</Text01M>
					<Text02S style={styles.description}>
						{totalFeeDisplay.bitcoinSymbol}
						{totalFeeDisplay.bitcoinFormatted}
					</Text02S>
				</View>
			) : (
				<View />
			)}
		</Card>
	);
};

const styles = StyleSheet.create({
	card: {
		minHeight: 62,
		marginBottom: 8,
		borderRadius: 20,
		paddingHorizontal: 16,
		alignItems: 'center',
		flexDirection: 'row',
		borderWidth: 1,
	},
	container: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: {
		marginLeft: 10,
		marginRight: 22,
		minWidth: 20,
	},
	title: {
		fontWeight: 'bold',
	},
	description: {},
	sats: {
		flex: 1,
		alignItems: 'flex-end',
	},
	col1: {
		flex: 1,
		alignItems: 'center',
		flexDirection: 'row',
		backgroundColor: 'transparent',
	},
	col2: {
		alignContent: 'flex-end',
		right: 4,
		backgroundColor: 'transparent',
	},
	titleContainer: {
		flex: 1,
		marginHorizontal: 12,
	},
	speedText: {
		marginTop: 5,
	},
});

export default memo(FeePickerCard);
