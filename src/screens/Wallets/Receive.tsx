/**
 * @format
 * @flow strict-local
 */

import React, { memo, useEffect, useState } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View, Text } from '../../styles/components';
import QRCode from 'react-native-qrcode-svg';
import Animated, { Easing } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import Store from '../../store/types';

const updateOpacity = ({
	opacity = new Animated.Value(0),
	toValue = 0,
	duration = 1000,
}) => {
	try {
		Animated.timing(opacity, {
			toValue,
			duration,
			easing: Easing.inOut(Easing.ease),
		}).start();
	} catch {}
};

const Receive = () => {
	const wallet = useSelector((state: Store) => state.wallet);
	const [opacity] = useState(new Animated.Value(0));
	const { selectedWallet, selectedNetwork } = wallet;
	const addresses = wallet.wallets[selectedWallet].addresses[selectedNetwork];
	const key = Object.keys(addresses)[0];
	const address = addresses[key].address;

	useEffect(() => {
		setTimeout(() => {
			updateOpacity({ opacity, toValue: 1 });
		}, 100);
		return () => updateOpacity({ opacity, toValue: 0, duration: 0 });
	}, []);

	LayoutAnimation.easeInEaseOut();

	return (
		<Animated.View style={[styles.container, { opacity }]}>
			<View color="transparent" style={{ alignItems: 'center' }}>
				<QRCode value={address} size={200} />
				<Text style={styles.text}>{address}</Text>
			</View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 20,
	},
	text: {
		fontWeight: 'bold',
		fontSize: 14,
		textAlign: 'center',
		marginTop: 10,
	},
});

export default memo(Receive);
