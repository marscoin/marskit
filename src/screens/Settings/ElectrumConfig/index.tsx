import React, { memo, ReactElement, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
	Text,
	View,
	TextInput,
	RadioButtonRN,
} from '../../../styles/components';
import { addElectrumPeer } from '../../../store/actions/settings';
import {
	ICustomElectrumPeer,
	RadioButtonItem,
	TProtocol,
} from '../../../store/types/settings';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { connectToElectrum } from '../../../utils/wallet/electrum';
import NavigationHeader from '../../../components/NavigationHeader';
import Button from '../../../components/Button';
import { objectsMatch, shuffleArray } from '../../../utils/helpers';
import { err, ok, Result } from '@synonymdev/result';
import {
	defaultElectrumPorts,
	getDefaultPort,
	getPeers,
	IFormattedPeerData,
} from '../../../utils/electrum';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../../utils/notifications';
import { getConnectedPeer, IPeerData } from '../../../utils/wallet/electrum';

const radioButtons: RadioButtonItem[] = [
	{ label: 'TCP', value: 'tcp' },
	{ label: 'TLS', value: 'ssl' },
];

const validateInput = ({
	host = '',
	port = '',
}: {
	host: string;
	port: string | number;
}): Result<string> => {
	//Ensure the user passed in a host & port to test.
	let data;
	if (host === '' && port === '') {
		data = 'Please specify a host and port to connect to.';
	} else if (host === '') {
		data = 'Please specify a host to connect to.';
	} else if (port === '') {
		data = 'Please specify a port to connect to.';
	} else if (isNaN(Number(port))) {
		data = 'Invalid port.';
	}
	if (data) {
		return err(data);
	}
	return ok('');
};

const ElectrumConfig = (): ReactElement => {
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const customElectrumPeers = useSelector(
		(state: Store) => state.settings.customElectrumPeers[selectedNetwork],
	);
	const savedPeer = customElectrumPeers[0];
	const [host, setHost] = useState(savedPeer?.host || '');
	const [protocol, setProtocol] = useState<TProtocol>(
		savedPeer?.protocol ? savedPeer.protocol : 'ssl',
	);
	const [port, setPort] = useState(
		savedPeer?.protocol
			? savedPeer[savedPeer.protocol]
			: getDefaultPort(selectedNetwork, protocol),
	);
	const [randomPeers, setRandomPeers] = useState<IFormattedPeerData[]>([]);

	const [connectedPeer, setConnectedPeer] = useState<IPeerData>({
		host: '',
		port: '',
		protocol: '',
	});
	const [loading, setLoading] = useState(false);

	const getAndUpdateConnectedPeer = async (): Promise<void> => {
		const peerInfo = await getConnectedPeer(selectedNetwork);
		if (peerInfo.isOk()) {
			setConnectedPeer({
				...peerInfo.value,
				port: peerInfo.value.port.toString(),
			});
		}
		const randomPeersResponse = await getPeers({ selectedNetwork });
		if (randomPeersResponse.isOk()) {
			setRandomPeers(randomPeersResponse.value);
		}
	};

	const saveConnectedPeer = (): void => {
		try {
			if (host !== connectedPeer?.host) {
				setHost(connectedPeer?.host);
			}
			if (port !== connectedPeer?.port.toString()) {
				setPort(connectedPeer?.port.toString());
			}
			if (protocol !== connectedPeer?.protocol) {
				setProtocol(connectedPeer?.protocol);
			}
			connectAndAddPeer({
				host: connectedPeer.host,
				port: String(connectedPeer.port),
				protocol: connectedPeer.protocol,
			});
		} catch (e) {
			console.log(e);
		}
	};

	const initialIndex = useMemo((): number => {
		let index = -1;
		try {
			radioButtons.map((button, i) => {
				if (protocol === button.value) {
					index = i + 1;
				}
			});
			return index || -1;
		} catch (e) {
			return index;
		}
	}, [protocol]);

	const connectAndAddPeer = async (peerData: {
		host: string;
		port: number | string;
		protocol: TProtocol;
	}): Promise<void> => {
		try {
			if (loading) {
				return;
			}
			if (!peerData) {
				peerData = { host, port, protocol };
			}
			if (typeof port === 'number') {
				peerData.port.toString();
			}

			setLoading(true);
			const validityCheck = validateInput(peerData);
			if (validityCheck.isErr()) {
				showErrorNotification({
					title: 'Electrum Peer Error',
					message: validityCheck.error.message,
				});
				return;
			}
			const customPeer: ICustomElectrumPeer = {
				host: '',
				protocol: '',
				ssl: Number(getDefaultPort(selectedNetwork, 'ssl')),
				tcp: Number(getDefaultPort(selectedNetwork, 'tcp')),
			};
			const connectData = {
				...customPeer,
				host: peerData.host.trim(),
				protocol: peerData.protocol.trim(),
				[protocol]: peerData.port.toString().trim(),
			};
			const connectResponse = await connectToElectrum({
				selectedNetwork,
				customPeers: [connectData],
			});
			setLoading(false);
			if (connectResponse.isOk()) {
				addElectrumPeer({ selectedNetwork, peer: connectData });
				showSuccessNotification({
					title: 'Electrum Server Updated',
					message: `Successfully connected to ${host}:${port}`,
				});
				getAndUpdateConnectedPeer();
				const getPeersResult = await getPeers({ selectedNetwork });
				if (getPeersResult.isOk()) {
					setRandomPeers(getPeersResult.value);
				}
			} else {
				showErrorNotification({
					title: 'Unable to connect to Electrum Server.',
					message: connectResponse.error.message,
				});
			}
		} catch (e) {
			console.log(e);
			setLoading(false);
		}
	};

	/**
	 * Compare against the currently saved peer.
	 * @param _peer
	 */
	const peersMatch = (_peer: IPeerData): boolean => {
		try {
			if (!savedPeer.protocol) {
				return false;
			}
			return objectsMatch(_peer, {
				host: savedPeer.host.toLowerCase(),
				port: savedPeer[savedPeer.protocol],
				protocol: savedPeer.protocol,
			});
		} catch (e) {
			return false;
		}
	};

	const getRandomPeer = async (): Promise<void> => {
		if (randomPeers?.length > 0) {
			const shuffledArr = shuffleArray(randomPeers);
			for (let i = 0; i < shuffledArr.length; i++) {
				if (
					host !== shuffledArr[i]?.host.toLowerCase() &&
					connectedPeer.host !== shuffledArr[i]?.host.toLowerCase()
				) {
					const peer = shuffledArr[i];
					setHost(peer.host.toLowerCase());
					setPort(peer[protocol].toString().replace(/\D/g, ''));
					break;
				}
			}
		}
	};

	useEffect(() => {
		getAndUpdateConnectedPeer();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<View style={styles.container}>
			<NavigationHeader title="Electrum Config" />
			<View style={styles.content}>
				{!!connectedPeer?.host && (
					<>
						<Text style={styles.title}>Connected to:</Text>
						<View style={styles.row}>
							<View style={styles.connectedPeer}>
								<Text>
									{connectedPeer.host}:{connectedPeer.port}
								</Text>
							</View>
							{!peersMatch(connectedPeer) && (
								<View style={styles.savePeer}>
									<Button
										text="Save this peer"
										color="surface"
										onPress={saveConnectedPeer}
									/>
								</View>
							)}
						</View>
					</>
				)}

				<View style={styles.divider} />

				<Text style={styles.title}>Custom Peer:</Text>

				<View style={styles.divider} />

				<Text style={styles.title}>Host</Text>
				<TextInput
					style={styles.textInput}
					textAlignVertical={'center'}
					underlineColorAndroid="transparent"
					autoCapitalize="none"
					autoCompleteType="off"
					keyboardType="default"
					autoCorrect={false}
					onChangeText={setHost}
					value={host}
				/>

				<View style={styles.divider} />

				<Text style={styles.title}>Port</Text>
				<TextInput
					style={styles.textInput}
					textAlignVertical={'center'}
					underlineColorAndroid="transparent"
					autoCapitalize="none"
					autoCompleteType="off"
					keyboardType="number-pad"
					autoCorrect={false}
					onChangeText={setPort}
					value={port}
				/>

				<View style={styles.divider} />

				<Text style={styles.title}>Protocol</Text>
				<RadioButtonRN
					data={radioButtons}
					selectedBtn={(e): void => {
						let value = '';
						try {
							value = e.value;
						} catch {}
						setProtocol(value);
						//Toggle the port if the protocol changes and the default ports are still set.
						if (!port || defaultElectrumPorts.includes(port.toString())) {
							setPort(getDefaultPort(selectedNetwork, value));
						}
					}}
					initial={initialIndex}
				/>

				<View style={styles.divider} />
				<View style={styles.bottomRow}>
					<Button
						text="Randomize Peer"
						color="surface"
						onPress={getRandomPeer}
					/>
					{!peersMatch({ host, port, protocol }) && (
						<Button
							text="Save Peer"
							color="surface"
							loading={loading}
							onPress={(): void => {
								connectAndAddPeer({ host, port, protocol });
							}}
						/>
					)}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 20,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		paddingVertical: 8,
		justifyContent: 'center',
	},
	bottomRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		justifyContent: 'space-around',
	},
	divider: {
		marginVertical: 10,
	},
	title: {
		fontWeight: 'bold',
		fontSize: 16,
	},
	connectedPeer: {
		flex: 1.5,
	},
	savePeer: {
		alignItems: 'center',
		flex: 1,
	},
	textInput: {
		minHeight: 50,
		borderRadius: 5,
		fontWeight: 'bold',
		fontSize: 18,
		textAlign: 'left',
		color: 'gray',
		borderBottomWidth: 1,
		borderColor: 'gray',
		paddingHorizontal: 10,
		backgroundColor: 'white',
		marginVertical: 5,
	},
});

export default memo(ElectrumConfig);
