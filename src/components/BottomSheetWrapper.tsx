import React, {
	memo,
	ReactElement,
	forwardRef,
	useImperativeHandle,
	useRef,
	useEffect,
	useCallback,
} from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../styles/components';
import BottomSheet from 'reanimated-bottom-sheet';
import { useSelector } from 'react-redux';
import Store from '../store/types';
import { toggleView } from '../store/actions/user';
import { TViewController } from '../store/types/user';

const snapPoints = ['95%', '55%', 0];
export interface IModalProps {
	children: ReactElement;
	view?: TViewController;
	onOpen?: () => any;
	onClose?: () => any;
}
const BottomSheetWrapper = forwardRef(
	(
		{
			children,
			view,
			onOpen = (): null => null,
			onClose = (): null => null,
		}: IModalProps,
		ref,
	): ReactElement => {
		const data = useSelector((state: Store) =>
			view ? state.user?.viewController[view] : undefined,
		);
		const modalRef = useRef<BottomSheet>(null);

		useEffect(() => {
			try {
				if (view && data?.isOpen) {
					if (data.snapPoint) {
						// @ts-ignore
						modalRef.current.snapTo(data.snapPoint);
					} else {
						// @ts-ignore
						modalRef.current.snapTo(0);
					}
				}
			} catch {}
		}, [data?.isOpen, data?.snapPoint, view]);

		useImperativeHandle(ref, () => ({
			snapToIndex(index: number = 0): void {
				// @ts-ignore
				modalRef.current.snapTo(index);
			},
			expand(): void {
				// @ts-ignore
				modalRef.current.snapTo(0);
			},
			close(): void {
				// @ts-ignore
				modalRef.current.close(-1);
			},
		}));

		const _onOpen = useCallback(() => {
			onOpen();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		const _onClose = useCallback(() => {
			if (view) {
				toggleView({
					view,
					data: { isOpen: false },
				}).then();
			}
			onClose();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [view]);

		return (
			<BottomSheet
				ref={modalRef}
				initialSnap={2}
				snapPoints={snapPoints}
				onOpenStart={_onOpen}
				onCloseEnd={_onClose}
				renderContent={(): ReactElement => {
					return (
						<View style={styles.container}>
							<View style={styles.spacer} />
							{children}
						</View>
					);
				}}
			/>
		);
	},
);

const styles = StyleSheet.create({
	container: {
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		height: '100%',
	},
	spacer: {
		alignSelf: 'center',
		height: 4,
		width: 32,
		borderRadius: 32,
		backgroundColor: '#636366',
		marginTop: 7,
		marginBottom: 11,
	},
});

export default memo(BottomSheetWrapper);
