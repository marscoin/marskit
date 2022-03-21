/***********************************************************************************
 * This component wraps the reanimated-bottom-sheet library
 * to more easily take advantage of it throughout the app.
 *
 * Implementation:
 * <BottomSheetWrapper view="viewName">
 *   <View>...</View>
 * </BottomSheetWrapper>
 *
 * Usage Throughout App:
 * toggleView({ view: 'viewName', data: { isOpen: true, snapPoint: 1 }});
 * toggleView({ view: 'viewName', data: { isOpen: false }});
 *
 * Check if a given view is open:
 * getStore().user.viewController['viewName'].isOpen;
 ***********************************************************************************/

import React, {
	memo,
	ReactElement,
	forwardRef,
	useImperativeHandle,
	useRef,
	useEffect,
	useCallback,
	useMemo,
} from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../styles/components';
import BottomSheet from 'reanimated-bottom-sheet';
import { useSelector } from 'react-redux';
import Store from '../store/types';
import { toggleView } from '../store/actions/user';
import { TViewController } from '../store/types/user';
import { usePrevious } from '../hooks/helpers';
import { IThemeColors } from '../styles/themes';

export interface IModalProps {
	children: ReactElement;
	view?: TViewController;
	onOpen?: () => any;
	onClose?: () => any;
	headerColor?: IThemeColors;
	displayHeader?: boolean;
	snapPoints?: any[];
}
const BottomSheetWrapper = forwardRef(
	(
		{
			children,
			view,
			onOpen = (): null => null,
			onClose = (): null => null,
			headerColor = undefined,
			displayHeader = true,
			snapPoints = ['95%', '65%', 0],
		}: IModalProps,
		ref,
	): ReactElement => {
		const data = useSelector((state: Store) =>
			view ? state.user?.viewController[view] : undefined,
		);
		const previousData = usePrevious(data);
		const modalRef = useRef<BottomSheet>(null);

		const backgroundColor = useMemo(() => {
			if (headerColor) {
				return headerColor;
			}
			return 'tabBackground';
		}, [headerColor]);

		useEffect(() => {
			try {
				// @ts-ignore
				if (view && data?.snapPoint !== previousData?.snapPoint) {
					// @ts-ignore
					modalRef.current.snapTo(data?.snapPoint);
				}
			} catch {}
			//eslint-disable-next-line react-hooks/exhaustive-deps
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
					data: { isOpen: false, id: data?.id },
				}).then();
			}
			onClose();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [view]);

		const Header = useCallback(() => {
			return displayHeader ? (
				<View style={styles.handleContainer} color="onSurface">
					<View style={styles.handle} />
				</View>
			) : null;
		}, [displayHeader]);

		return (
			<BottomSheet
				ref={modalRef}
				initialSnap={2}
				snapPoints={snapPoints}
				onOpenStart={_onOpen}
				onCloseEnd={_onClose}
				renderHeader={Header}
				renderContent={(): ReactElement => {
					return (
						<View style={styles.container} color={backgroundColor}>
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
	handleContainer: {
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
	},
	handle: {
		alignSelf: 'center',
		height: 4,
		width: 32,
		borderRadius: 32,
		backgroundColor: '#636366',
		marginTop: 12,
		marginBottom: 11,
	},
});

export default memo(BottomSheetWrapper);
