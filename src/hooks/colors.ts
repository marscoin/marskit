import { useSelector } from 'react-redux';
import { IColors } from '../styles/colors';
import { IThemeColors } from '../styles/themes';
import { themeColorsSelector } from '../store/reselect/settings';

export default function useColors(): IColors & IThemeColors {
	return useSelector(themeColorsSelector);
}
