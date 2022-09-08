import { StackNavigationProp } from '@react-navigation/stack';
import { IService, IGetOrderResponse } from '@synonymdev/blocktank-client';
import { IActivityItem } from '../../store/types/activity';
import { TAssetType } from '../../store/types/wallet';

export type RootNavigationProp = StackNavigationProp<RootStackParamList>;

export type RootStackParamList = {
	RootAuthCheck: { onSuccess: () => void };
	Tabs: undefined;
	Biometrics: undefined;
	Blocktank: undefined;
	BlocktankOrder: {
		service: IService;
		existingOrderId: string;
	};
	BlocktankPayment: {
		order: IGetOrderResponse;
	};
	ActivityDetail: { activityItem: IActivityItem; extended?: boolean };
	ActivityFiltered: undefined;
	Scanner: undefined;
	WalletsDetail: {
		assetType: TAssetType;
	};
	Introduction: undefined;
	QuickSetup: undefined;
	CustomSetup: undefined;
	QuickConfirm: undefined;
	Result: undefined;
	LightningRoot: undefined;
	Settings: undefined;
	Profile: undefined;
	ProfileEdit: undefined;
	Contacts: undefined;
	ContactEdit: undefined;
	Contact: undefined;
};
