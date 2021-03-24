/**
 * @fileOverview adapter for ReactNative TCP module
 * This module mimics the nodejs tls api and is intended to work in RN environment.
 * @see https://github.com/Rapsssito/react-native-tcp-socket
 */

import TcpSocket from 'react-native-tcp-socket';
import TcpSockets from 'react-native-tcp-socket/lib/types/TcpSocket';

/**
 * Constructor function. Mimicking nodejs/tls api
 *
 * @constructor
 */
interface IClient extends TcpSockets {
	setEncoding?: Function | undefined;
	setKeepAlive?: Function | undefined;
}
function connect(this: { _noDelay: boolean }, config, callback): IClient {
	const client: IClient = TcpSocket.createConnection(
		{
			port: config.port,
			host: config.host,
			tls: true,
			tlsCheckValidity: config.rejectUnauthorized,
		},
		callback,
	);

	// defaults:
	this._noDelay = true;

	//client.setTimeout = () => {};
	client.setEncoding = (): void => {};
	client.setKeepAlive = (): void => {};

	// we will save `noDelay` and proxy it to socket object when its actually created and connected:
	const realSetNoDelay = client.setNoDelay; // reference to real setter
	client.setNoDelay = (noDelay: boolean): void => {
		this._noDelay = noDelay;
	};

	client.on('connect', (): void => {
		realSetNoDelay.apply(client, [this._noDelay]);
	});

	return client;
}

module.exports.connect = connect;
