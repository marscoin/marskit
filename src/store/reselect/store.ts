import { createSelector } from '@reduxjs/toolkit';
import Store from '../types';
import { IWallet } from '../types/wallet';
import { ISettings } from '../types/settings';
import { IMetadata } from '../types/metadata';
import { IActivity } from '../types/activity';
import { ILightning } from '../types/lightning';
import { IBlocktank } from '../types/blocktank';
import { IFees } from '../types/fees';
import { ISlashtags } from '../types/slashtags';
import { IUser } from '../types/user';
import { lightningState, walletState } from './wallet';
import { settingsState } from './settings';

export const getStoreSelector = createSelector(
	(state: Store): Store => state,
	(state): Store => JSON.parse(JSON.stringify(state)),
);

export const getWalletStoreSelector = createSelector(
	walletState,
	(wallet): IWallet => JSON.parse(JSON.stringify(wallet)),
);

export const getSettingsStoreSelector = createSelector(
	settingsState,
	(settings): ISettings => JSON.parse(JSON.stringify(settings)),
);

export const getMetaDataStoreSelector = createSelector(
	(state: Store): IMetadata => state.metadata,
	(metadata): IMetadata => JSON.parse(JSON.stringify(metadata)),
);

export const getActivityStoreSelector = createSelector(
	(state: Store): IActivity => state.activity,
	(activity): IActivity => JSON.parse(JSON.stringify(activity)),
);

export const getLightningStoreSelector = createSelector(
	lightningState,
	(lightning): ILightning => JSON.parse(JSON.stringify(lightning)),
);

export const getBlocktankStoreSelector = createSelector(
	(state: Store): IBlocktank => state.blocktank,
	(blocktank): IBlocktank => JSON.parse(JSON.stringify(blocktank)),
);

export const getFeesStoreSelector = createSelector(
	(state: Store): IFees => state.fees,
	(fees): IFees => JSON.parse(JSON.stringify(fees)),
);

export const getSlashtagsStoreSelector = createSelector(
	(state: Store): ISlashtags => state.slashtags,
	(slashtags): ISlashtags => JSON.parse(JSON.stringify(slashtags)),
);

export const getUserStoreSelector = createSelector(
	(state: Store): IUser => state.user,
	(user): IUser => JSON.parse(JSON.stringify(user)),
);
