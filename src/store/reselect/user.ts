import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import {
	IViewControllerData,
	TUserViewController,
	TViewController,
} from '../types/user';

const viewControllerState = (state: Store): TUserViewController =>
	state.user.viewController;
const isGeoBlockedState = (state: Store): boolean => state.user.isGeoBlocked;
const backupVerifiedState = (state: Store): boolean =>
	state.user.backupVerified;
const ignoreBackupTimestampState = (state: Store): number =>
	state.user.ignoreBackupTimestamp;
const showLaterButtonState = (state: Store): boolean | undefined =>
	state.user.viewController.PINPrompt.showLaterButton;

/**
 * Returns all viewController data.
 */
export const viewControllersSelector = createSelector(
	viewControllerState,
	(viewControllers): TUserViewController => viewControllers,
);

/**
 * Returns specified viewController data.
 */
export const viewControllerSelector = createSelector(
	[
		viewControllerState,
		(viewControllers, viewController: TViewController): TViewController =>
			viewController,
	],
	(viewControllers, viewController): IViewControllerData =>
		viewControllers[viewController],
);

export const viewControllerIsOpenSelector = createSelector(
	[
		viewControllerState,
		(viewControllers, viewController: TViewController): TViewController =>
			viewController,
	],
	(viewControllers, viewController): boolean =>
		viewControllers[viewController].isOpen,
);

export const isGeoBlockedSelector = createSelector(
	isGeoBlockedState,
	(isGeoblocked): boolean => isGeoblocked ?? false,
);

export const backupVerifiedSelector = createSelector(
	backupVerifiedState,
	(backupVerified): boolean => backupVerified,
);

export const ignoreBackupTimestampSelector = createSelector(
	ignoreBackupTimestampState,
	(ignoreBackupTimestamp): number => ignoreBackupTimestamp,
);

export const showLaterButtonSelector = createSelector(
	showLaterButtonState,
	(showLaterButton): boolean | undefined => showLaterButton,
);
