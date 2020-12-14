import { useEffect } from 'react';
import { startLnd } from "../lightning-debug";
import { useDispatch } from "react-redux";
import { updateLightning } from "../../store/actions/lightning";
import lnd from "react-native-lightning";
import { TCurrentLndState } from "react-native-lightning/dist/types";

export default function useLightning(): void {
	const dispatch = useDispatch();

	const updateLightningState = (state: TCurrentLndState) => {
		try {
			dispatch(updateLightning({ state }));
		} catch {}
	};

	//TODO find a way to subscribe to these changes instead of polling the LND getinfo
	let previousInfoResponseString = ""; //Used to check we're not just updating no changes and spamming the logs
	const pollLndGetInfo = async () => {
		const res = await lnd.getInfo();
		if (res.isOk()) {
			if (previousInfoResponseString !== JSON.stringify(res.value)) {
				dispatch(updateLightning({ info: res.value }));
			}

			previousInfoResponseString = JSON.stringify(res.value)
		}

		setTimeout(pollLndGetInfo, 3000);
	}

	useEffect(() => {
		(async () => {
			const stateRes = await lnd.currentState();
			if (stateRes.isOk()) {
				updateLightningState(stateRes.value);
			}

			//Any future updates to LND state
			lnd.subscribeToCurrentState(updateLightningState);

			if (stateRes.isOk() && !stateRes.value.grpcReady) {
				await startLnd();
			}

			await pollLndGetInfo();
		})()
	}, []);

	return;
}
