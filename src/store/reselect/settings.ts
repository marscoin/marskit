import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { TBitcoinUnit } from '../types/wallet';
import {
	ICustomElectrumPeer,
	ISettings,
	TCoinSelectPreference,
	TCustomElectrumPeers,
	TReceiveOption,
	TTransactionSpeed,
	TUnitPreference,
} from '../types/settings';
import { TAvailableNetworks } from '../../utils/networks';

export const settingsState = (state: Store): ISettings => state.settings;
const selectedCurrencyState = (state: Store): string =>
	state.settings.selectedCurrency;
const bitcoinUnitState = (state: Store): TBitcoinUnit =>
	state.settings.bitcoinUnit;
const coinSelectAutoState = (state: Store): boolean =>
	state.settings.coinSelectAuto;
const coinSelectPreferenceState = (state: Store): TCoinSelectPreference =>
	state.settings.coinSelectPreference;
const unitPreferenceState = (state: Store): TUnitPreference =>
	state.settings.unitPreference;
const hideOnboardingMessageState = (state: Store): boolean =>
	state.settings.hideOnboardingMessage;
const hideBalanceState = (state: Store): boolean => state.settings.hideBalance;
const enableOfflinePaymentsState = (state: Store): boolean =>
	state.settings.enableOfflinePayments;
const enableDevOptionsState = (state: Store): boolean =>
	state.settings.enableDevOptions;
const pinState = (state: Store): boolean => state.settings.pin;
const customElectrumPeersState = (state: Store): TCustomElectrumPeers =>
	state.settings.customElectrumPeers;
const transactionSpeedState = (state: Store): TTransactionSpeed =>
	state.settings.transactionSpeed;
const showSuggestionsState = (state: Store): boolean =>
	state.settings.showSuggestions;
const receivePreferenceState = (state: Store): TReceiveOption[] =>
	state.settings.receivePreference;
const pinForPaymentsState = (state: Store): boolean =>
	state.settings.pinForPayments;

export const settingsSelector = createSelector(
	settingsState,
	(settings): ISettings => settings,
);
export const selectedCurrencySelector = createSelector(
	selectedCurrencyState,
	(selectedCurrency): string => selectedCurrency,
);
export const bitcoinUnitSelector = createSelector(
	bitcoinUnitState,
	(bitcoinUnit): TBitcoinUnit => bitcoinUnit,
);
export const unitPreferenceSelector = createSelector(
	unitPreferenceState,
	(unitPreference): TUnitPreference => unitPreference,
);
export const coinSelectAutoSelector = createSelector(
	coinSelectAutoState,
	(coinSelectAuto): boolean => coinSelectAuto,
);
export const hideOnboardingMessageSelector = createSelector(
	hideOnboardingMessageState,
	(hideOnboardingMessage): boolean => hideOnboardingMessage,
);
export const hideBalanceSelector = createSelector(
	hideBalanceState,
	(hideBalance): boolean => hideBalance,
);
export const enableOfflinePaymentsSelector = createSelector(
	enableOfflinePaymentsState,
	(enableOfflinePayments): boolean => enableOfflinePayments,
);
export const enableDevOptionsSelector = createSelector(
	enableDevOptionsState,
	(enableDevOptions): boolean => enableDevOptions,
);
export const pinSelector = createSelector(pinState, (pin): boolean => pin);

export const coinSelectPreferenceSelector = createSelector(
	coinSelectPreferenceState,
	(coinSelectPreference): TCoinSelectPreference => coinSelectPreference,
);
export const customElectrumPeersSelector = createSelector(
	[
		customElectrumPeersState,
		(
			customElectrumPeers,
			selectedNetwork: TAvailableNetworks,
		): TAvailableNetworks => selectedNetwork,
	],
	(customElectrumPeers, selectedNetwork): ICustomElectrumPeer[] =>
		customElectrumPeers[selectedNetwork],
);
export const transactionSpeedSelector = createSelector(
	transactionSpeedState,
	(transactionSpeed): TTransactionSpeed => transactionSpeed,
);
export const showSuggestionsSelector = createSelector(
	showSuggestionsState,
	(showSuggestions): boolean => showSuggestions,
);
export const receivePreferenceSelector = createSelector(
	receivePreferenceState,
	(receivePreference): TReceiveOption[] => receivePreference,
);
export const pinForPaymentsSelector = createSelector(
	pinForPaymentsState,
	(pinForPayments): boolean => pinForPayments,
);
