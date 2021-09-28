import React, {
	memo,
	ReactElement,
	forwardRef,
	useImperativeHandle,
	useRef,
} from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../styles/components';
import BottomSheet from 'reanimated-bottom-sheet';

const snapPoints = ['95%', '55%', 0];
export interface IModalProps {
	children: ReactElement;
	snapPoints?: string[];
}
const BottomSheetWrapper = forwardRef(
	({ children }: IModalProps, ref): ReactElement => {
		const modalRef = useRef<BottomSheet>(null);
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

		return (
			<BottomSheet
				ref={modalRef}
				initialSnap={2}
				snapPoints={snapPoints}
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
