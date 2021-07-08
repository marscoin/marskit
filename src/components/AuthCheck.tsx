import React, { memo, ReactElement, useEffect, useState } from 'react';
import PinPad from './PinPad';
import Biometrics from './Biometrics';
import { RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Store from '../store/types';

export interface IAuthCheck {
	children?: ReactElement;
	onSuccess?: Function;
	onFailure?: Function;
	bypass?: boolean;
}
export interface IAuthCheckParams extends IAuthCheck {
	route?: RouteProp<{ params: IAuthCheck }, 'params'>;
}

/**
 * This component checks if the user has enabled pin or biometrics and runs through each check as needed before proceeding.
 * @param {ReactElement} children
 * @param {Function} onSuccess
 * @param {Function} onFailure
 * @param {boolean} bypass
 * @param {RouteProp<{ params: IAuthCheck }, 'params'>} route
 */
const AuthCheck = ({
	children = <></>,
	onSuccess = (): null => null,
	onFailure = (): null => null,
	bypass = false,
	route,
}: IAuthCheckParams): ReactElement => {
	const [displayPin, setDisplayPin] = useState(false);
	const [displayBiometrics, setDisplayBiometrics] = useState(false);
	const [authCheckParams, setAuthCheckParams] = useState<IAuthCheck>({
		onSuccess,
		onFailure,
		bypass,
	});

	const pin = useSelector((state: Store) => state.settings.pin);
	const biometrics = useSelector((state: Store) => state.settings.biometrics);

	useEffect(() => {
		if (route && route?.params) {
			try {
				setAuthCheckParams({
					onSuccess: route.params?.onSuccess || onSuccess,
					onFailure: route.params?.onFailure || onFailure,
					bypass: route.params?.bypass || bypass,
				});
			} catch {}
		}
		pinCheck();
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const pinCheck = (): void => {
		if (authCheckParams.bypass) {
			return;
		}
		if (pin) {
			setDisplayPin(true);
		} else {
			bioMetricCheck();
		}
	};

	const bioMetricCheck = (): void => {
		if (displayPin) {
			setDisplayPin(false);
		}

		if (biometrics) {
			setDisplayBiometrics(true);
		} else {
			if (authCheckParams?.onSuccess) {
				authCheckParams.onSuccess();
			}
		}
	};

	if (displayPin) {
		return (
			<PinPad
				onSuccess={bioMetricCheck}
				pinSetup={false}
				displayBackButton={false}
			/>
		);
	}

	if (displayBiometrics) {
		return (
			<Biometrics
				onSuccess={(): void => {
					setDisplayBiometrics(false);
					if (authCheckParams?.onSuccess) {
						authCheckParams.onSuccess();
					}
				}}
				onFailure={authCheckParams?.onFailure || onFailure}
			/>
		);
	}

	return children;
};

export default memo(AuthCheck);
