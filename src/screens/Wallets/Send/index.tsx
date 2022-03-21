import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import { View } from '../../../styles/components';
import { StyleSheet } from 'react-native';
import { capitalize } from '../../../utils/helpers';
import { resetOnChainTransaction } from '../../../store/actions/wallet';
import SendOnChainTransaction from '../SendOnChainTransaction';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import NavigationHeader from '../../../components/NavigationHeader';
import { toggleView } from '../../../store/actions/user';

const onBackPress = (): void => {
	toggleView({
		view: 'sendAssetPicker',
		data: { isOpen: true, snapPoint: 1 },
	}).then();
};

interface ISendProps {
	asset: string;
	onComplete?: Function;
}
const Send = (props: ISendProps): ReactElement => {
	const { asset, onComplete = (): null => null } = useMemo(
		() => props,
		[props],
	);
	const headerText = useMemo(
		(): string => (asset ? `Send ${capitalize(asset)}` : 'Send'),
		[asset],
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);

	const _onComplete = useCallback(() => {
		if (asset === 'bitcoin') {
			resetOnChainTransaction({
				selectedWallet,
				selectedNetwork,
			});
		}
		onComplete();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedWallet, selectedNetwork]);

	return (
		<View color="onSurface" style={styles.container}>
			<NavigationHeader
				view={'send'}
				title={headerText}
				onBackPress={onBackPress}
			/>
			<SendOnChainTransaction {...props} onComplete={_onComplete} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default memo(Send);
