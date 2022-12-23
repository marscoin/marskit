import { Platform } from 'react-native';
import { getBuildNumber, getVersion } from 'react-native-device-info';
import { getNodeId, getNodeVersion } from './lightning';
import { getStore } from '../store/helpers';

/**
 * Support link for opening device mail app.
 * Includes BT orders, device details, app version and LDK node info.
 * @param orderId
 * @param additionalContext
 * @returns {Promise<`mailto:support@synonym.to?subject=Bitkit support&body=${string}`>}
 */
export const createSupportLink = async (
	orderId = '',
	additionalContext = '',
): Promise<string> => {
	const email = 'support@synonym.to';
	const subject = 'Bitkit support';
	let body = '';

	if (orderId) {
		body += `\nBlocktank order ID: ${orderId}`;
	} else {
		//No specific order ID so add all of them
		let orders = getStore().blocktank.orders;
		if (orders.length > 0) {
			body += `\nBlocktank order IDs: ${orders
				.map((o) => `${o._id}`)
				.join(', ')}`;
		}
	}

	if (additionalContext) {
		body += `\n${additionalContext}`;
	}

	body += `\nPlatform: ${Platform.OS}`;
	body += `\nVersion: ${getVersion()} (${getBuildNumber()})`;

	const ldkVersion = await getNodeVersion();
	if (ldkVersion.isOk()) {
		body += `\nLDK version: ldk-${ldkVersion.value.ldk} c_bindings-${ldkVersion.value.c_bindings})`;
	}

	const nodeId = await getNodeId();
	if (nodeId.isOk()) {
		body += `\nLDK node ID: ${nodeId.value}`;
	}

	return `mailto:${email}?subject=${subject}&body=${body}`;
};
