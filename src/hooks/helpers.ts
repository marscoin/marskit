import { useRef, useEffect } from 'react';

export const usePrevious = (value): any => {
	const ref = useRef();
	useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
};

export const useEffectOnlyOnce = (callback, dependencies, condition) => {
	const calledOnce = useRef(false);

	useEffect(() => {
		if (calledOnce.current) {
			return;
		}

		if (condition(dependencies)) {
			callback(dependencies);
			calledOnce.current = true;
		}
	}, [callback, condition, dependencies]);
};
