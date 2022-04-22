import { useSelector } from 'react-redux';
import Store from '../store/types';
import { IColors } from '../styles/colors';
import themes from '../styles/themes';

export default function useColors(): IColors {
	const colors = useSelector(
		(state: Store) => themes[state.settings.theme].colors,
	);
	return colors;
}
