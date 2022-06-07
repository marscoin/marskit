import { useSelector } from 'react-redux';
import Store from '../store/types';
import { IColors } from '../styles/colors';
import { IThemeColors } from '../styles/themes';
import themes from '../styles/themes';

export default function useColors(): IColors & IThemeColors {
	const colors = useSelector(
		(state: Store) => themes[state.settings.theme].colors,
	);
	return colors;
}
