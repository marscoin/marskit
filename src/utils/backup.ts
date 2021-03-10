import { Client } from 'backpack-host';
import bint from 'bint8array';
import { Readable, Duplex } from 'streamx';
import WSStream from 'webnet/websocket';
import { bytesToString, stringToBytes } from './converters';

const username = bint.fromString('anon');
const password = bint.fromString('password');

const serverInfo = {
	id: bint.fromString('test123'),
	url: 'wss://backpack.synonym.to',
};

const client = new Client(username, password, {
	connect: (info, cb): void => {
		const socket = new WebSocket(info.url);
		socket.onerror = (err) => cb(err);

		// socket must have stream api
		const ws = new WSStream(socket, {
			onconnect: () => cb(null, ws),
		});
	},
});

export const register = (): void => {
	client.register(serverInfo, (registerErr) => {
		if (registerErr) {
			return console.error(registerErr);
		}

		alert('Registered');
	});
};

export const store = (backup: string): void => {
	client.store(serverInfo, (storeErr, str) => {
		if (storeErr) {
			return console.error(storeErr);
		}

		const data = stringToBytes(backup);

		console.log(data);

		Readable.from(data).pipe(str);

		alert('saved!');
	});
};

export const retrieve = (): void => {
	client.retrieve(serverInfo, (err, channel) => {
		if (err) {
			return console.error(err);
		}

		channel.pipe(
			new Duplex({
				write(data, cb) {
					const str = bytesToString(data);

					console.log(data);

					alert(`fetched ${str} (${data.length})`);
					cb();
				},
			}),
		);
	});
};
