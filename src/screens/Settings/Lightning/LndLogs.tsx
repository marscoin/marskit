import React, { memo, ReactElement, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Feather, Text, TouchableOpacity } from '../../../styles/components';
import LogBox from '../../../components/LogBox';
import lnd from '@synonymdev/react-native-lightning';
import SafeAreaView from '../../../components/SafeAreaView';

const LndLogs = ({ navigation }): ReactElement => {
	const [content, setContent] = useState<string[]>([]);

	useEffect(() => {
		//Load contents of existing log file
		(async (): Promise<void> => {
			if (content.length > 1) {
				return;
			}

			const logFileContentRes = await lnd.getLogFileContent(100);
			if (logFileContentRes.isErr()) {
				setContent((prevContent) => [
					...prevContent,
					`ERROR: Failed to load existing logs. ${logFileContentRes.error.message}`,
				]);
				return;
			}

			setContent((prevContent) => [...logFileContentRes.value, ...prevContent]);
		})();

		//Subscribe to any log file updates
		const listener = lnd.addLogListener((log) => {
			setContent((prevContent) => [...prevContent, log]);
		});

		return (): void => {
			lnd.removeLogListener(listener);
		};
	}, [content.length]);

	return (
		<SafeAreaView>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={navigation.goBack}
				style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>LND logs</Text>
			</TouchableOpacity>
			<LogBox data={content} />
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 10,
		paddingVertical: 8,
	},
	backText: {
		fontSize: 20,
	},
});

export default memo(LndLogs);
