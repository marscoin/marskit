import React, { memo, ReactElement, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import Lottie from 'lottie-react-native';

import { Subtitle, Caption13Up } from '../../styles/components';
import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import Glow from '../../components/Glow';
import AmountToggle from '../../components/AmountToggle';
import Store from '../../store/types';
import { toggleView } from '../../store/actions/user';

const NewTxPrompt = (): ReactElement => {
	const snapPoints = useMemo(() => [600], []);

	const txid = useSelector(
		(store: Store) => store.user.viewController?.newTxPrompt?.txid,
	);
	const isOpen = useSelector(
		(store: Store) => store.user.viewController?.newTxPrompt?.isOpen,
	);

	const transaction = useSelector((store: Store) => {
		if (!txid) {
			return undefined;
		}
		const wallet = store.wallet.selectedWallet;
		const network = store.wallet.selectedNetwork;
		return store.wallet?.wallets[wallet]?.transactions[network]?.[txid];
	});

	const handleClose = (): void => {
		toggleView({
			view: 'newTxPrompt',
			data: { isOpen: false },
		});
	};

	const source = require('../../assets/illustrations/coin-stack-x.png');

	return (
		<BottomSheetWrapper
			snapPoints={snapPoints}
			headerColor="background"
			backdrop={true}
			onClose={handleClose}
			view="newTxPrompt">
			<View style={styles.root}>
				<Lottie
					source={require('../../assets/lottie/confetti-orange.json')}
					autoPlay
					loop
				/>
				<View>
					<Subtitle style={styles.title}>Payment reveived!</Subtitle>
					<Caption13Up style={styles.received} color="gray1">
						You just reveived
					</Caption13Up>

					{isOpen && transaction && (
						<AmountToggle sats={transaction.value * 10e8} />
					)}
				</View>

				<View style={styles.imageContainer}>
					<Glow style={styles.glow} size={600} color="white32" />
					<Image source={source} style={styles.image3} />
					<Image source={source} style={styles.image2} />
					<Image source={source} style={styles.image1} />
					<Image source={source} style={styles.image4} />
				</View>
			</View>
		</BottomSheetWrapper>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		paddingHorizontal: 16,
		justifyContent: 'space-between',
	},
	title: {
		marginBottom: 60,
		alignSelf: 'center',
	},
	received: {
		marginBottom: 8,
	},
	imageContainer: {
		alignSelf: 'center',
		position: 'relative',
		height: 250,
		width: 250,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
	},
	image1: {
		width: 220,
		height: 220,
		position: 'absolute',
		bottom: 0,
		transform: [{ scaleX: -1 }],
	},
	image2: {
		width: 220,
		height: 220,
		position: 'absolute',
		bottom: '7%',
		transform: [{ scaleX: -1 }, { rotate: '165deg' }],
	},
	image3: {
		width: 220,
		height: 220,
		position: 'absolute',
		bottom: '14%',
		transform: [{ scaleX: -1 }, { rotate: '150deg' }],
	},
	image4: {
		width: 220,
		height: 220,
		position: 'absolute',
		bottom: '75%',
		left: '65%',
		transform: [{ rotate: '45deg' }],
	},
	glow: {
		position: 'absolute',
	},
});

export default memo(NewTxPrompt);
