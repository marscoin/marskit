import React, { memo, ReactElement, useState } from 'react';
import { StyleSheet } from 'react-native';

import { View } from '../../styles/components';
import SearchInput from '../../components/SearchInput';
import List, { IListData } from '../../components/List';
import NavigationHeader from '../../components/NavigationHeader';
import SafeAreaInsets from '../../components/SafeAreaInsets';

/**
 * Generic settings view
 * @param title
 * @param data
 * @param showBackNavigation
 * @returns {JSX.Element}
 * @constructor
 */
const SettingsView = ({
	title,
	listData,
	showBackNavigation = true,
	showSearch = false,
	fullHeight = true,
	children,
	childrenPosition = 'top',
}: {
	title: string;
	listData?: IListData[];
	showBackNavigation: boolean;
	showSearch?: boolean;
	fullHeight?: boolean;
	children?: ReactElement | ReactElement[] | undefined;
	childrenPosition?: 'top' | 'bottom';
}): ReactElement => {
	const [search, setSearch] = useState('');
	const filteredListData = listData?.map((section) => {
		const filteredSectionData = section.data.filter((item) => {
			return item.title.toLowerCase().includes(search.toLowerCase());
		});

		const filteredSection = filteredSectionData.length > 0 ? section : null

		return { ...filteredSection, data: filteredSectionData };
	}) ?? [];

	return (
		<View style={[fullHeight ? styles.fullHeight : null]} color="black">
			<SafeAreaInsets type="top" />
			<NavigationHeader title={title} displayBackButton={showBackNavigation} />

			{showSearch ? (
				<SearchInput
					style={styles.searchInput}
					value={search}
					onChangeText={setSearch}
				/>
			) : null}

			{children && childrenPosition === 'top' ? (
				<View color="black">{children}</View>
			) : null}

			{listData ? (
				<View style={styles.listContent} color="black">
					<List data={filteredListData} />
				</View>
			) : null}

			{children && childrenPosition === 'bottom' ? (
				<View style={styles.childrenContent} color="black">
					{children}
				</View>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	searchInput: {
		marginHorizontal: 16,
	},
	listContent: {
		paddingHorizontal: 16,
	},
	childrenContent: {
		flex: 1,
	},
	fullHeight: {
		flex: 1,
	},
});

export default memo(SettingsView);
