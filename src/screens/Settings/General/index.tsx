import React, { memo, ReactElement, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { IListData } from '../../../components/List';
import SettingsView from './../SettingsView';
import { resetTodos } from '../../../store/actions/todos';
import Dialog from '../../../components/Dialog';
import type { SettingsScreenProps } from '../../../navigation/types';
import {
	bitcoinUnitSelector,
	selectedCurrencySelector,
	showSuggestionsSelector,
	transactionSpeedSelector,
} from '../../../store/reselect/settings';

const unitsBitcoin = {
	satoshi: 'Satoshis',
	BTC: 'Bitcoin',
};

const transactionSpeeds = {
	slow: 'Slow',
	normal: 'Normal',
	fast: 'Fast',
	custom: 'Custom',
};

const GeneralSettings = ({
	navigation,
}: SettingsScreenProps<'GeneralSettings'>): ReactElement => {
	const [showDialog, setShowDialog] = useState(false);

	const showSuggestions = useSelector(showSuggestionsSelector);
	const selectedTransactionSpeed = useSelector(transactionSpeedSelector);
	const selectedCurrency = useSelector(selectedCurrencySelector);
	const selectedBitcoinUnit = useSelector(bitcoinUnitSelector);

	const SettingsListData: IListData[] = useMemo(
		() => [
			{
				data: [
					{
						title: 'Local currency',
						value: selectedCurrency,
						type: 'button',
						onPress: (): void => navigation.navigate('CurrenciesSettings'),
					},
					{
						title: 'Bitcoin unit',
						value: unitsBitcoin[selectedBitcoinUnit],
						type: 'button',
						onPress: (): void => navigation.navigate('BitcoinUnitSettings'),
					},
					{
						title: 'Transaction speed',
						value: transactionSpeeds[selectedTransactionSpeed],
						type: 'button',
						onPress: (): void =>
							navigation.navigate('TransactionSpeedSettings'),
					},
					{
						title: 'Suggestions',
						value: showSuggestions ? 'Visible' : 'Hidden',
						type: 'button',
						onPress: (): void => navigation.navigate('SuggestionsSettings'),
					},
				],
			},
		],
		[
			selectedCurrency,
			selectedBitcoinUnit,
			selectedTransactionSpeed,
			showSuggestions,
			navigation,
		],
	);

	return (
		<>
			<SettingsView
				title="General"
				listData={SettingsListData}
				showBackNavigation={true}
			/>
			<Dialog
				visible={showDialog}
				title="Reset Suggestions?"
				description="Are you sure you want to reset the suggestions? They will
				reappear in case you have removed them from your Bitkit wallet
				overview."
				onCancel={(): void => {
					setShowDialog(false);
				}}
				onConfirm={(): void => {
					resetTodos();
					setShowDialog(false);
				}}
			/>
		</>
	);
};

export default memo(GeneralSettings);
