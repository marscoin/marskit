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

const entireState = (state: Store): Store => state;

export const getStoreSelector = createSelector(
	entireState,
	(state): Store => JSON.parse(JSON.stringify(state)),
);

export const getWalletStoreSelector = createSelector(
	[entireState],
	(state): IWallet => JSON.parse(JSON.stringify(state.wallet)),
);

export const getSettingsStoreSelector = createSelector(
	[entireState],
	(state): ISettings => JSON.parse(JSON.stringify(state.settings)),
);

export const getMetaDataStoreSelector = createSelector(
	[entireState],
	(state): IMetadata => JSON.parse(JSON.stringify(state.metadata)),
);

export const getActivityStoreSelector = createSelector(
	entireState,
	(state): IActivity => JSON.parse(JSON.stringify(state.activity)),
);

export const getLightningStoreSelector = createSelector(
	entireState,
	(state): ILightning => JSON.parse(JSON.stringify(state.lightning)),
);

export const getBlocktankStoreSelector = createSelector(
	entireState,
	(state): IBlocktank => JSON.parse(JSON.stringify(state.blocktank)),
);

export const getFeesStoreSelector = createSelector(
	entireState,
	(state): IFees => JSON.parse(JSON.stringify(state.fees)),
);

export const getSlashtagsStoreSelector = createSelector(
	entireState,
	(state): ISlashtags => JSON.parse(JSON.stringify(state.slashtags)),
);

export const getUserStoreSelector = createSelector(
	entireState,
	(state): IUser => JSON.parse(JSON.stringify(state.user)),
);
