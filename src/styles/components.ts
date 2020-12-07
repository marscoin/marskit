import { Platform } from "react-native";
import styled from "styled-components";
import _Feather from "react-native-vector-icons/Feather";
import _EvilIcon from "react-native-vector-icons/EvilIcons";
import _Ionicons from "react-native-vector-icons/Ionicons";
import _MaterialIcons from "react-native-vector-icons/MaterialIcons";

export const SafeAreaView = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

export const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

export const View = styled.View`
  background-color: ${props => props.color ? props.theme.colors[props.color] : props.theme.colors.background};
`;

export const TouchableOpacity = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.background};
`;

export const ScrollView = styled.ScrollView`
  background-color: ${props => props.theme.colors.background};
`;

export const StatusBar = styled.StatusBar.attrs((props) => ({
	animated: true,
	barStyle: Platform.OS === "android" ? "light-content" :  props.theme.id === "light" ? "dark-content" : "light-content"
}))`
`;

export const Text = styled.Text`
  color: ${props => props.color ? props.theme.colors[props.color] : props.theme.colors.text};
  font-family: ${props => props.font ? props.theme.fonts[props.font].fontFamily : props.theme.fonts.medium.fontFamily};
  font-weight: ${props => props.font ? props.theme.fonts[props.font].fontWeight : props.theme.fonts.medium.fontWeight};
`;

export const Feather = styled(_Feather).attrs((props) => ({
	color: props.color ? props.theme.colors[props.color] : props.theme.colors.text
}))`
`;

export const MaterialIcons = styled(_MaterialIcons).attrs((props) => ({
	color: props.color ? props.theme.colors[props.color] : props.theme.colors.text
}))`
`;

export const EvilIcon = styled(_EvilIcon).attrs((props) => ({
	color: props.color ? props.theme.colors[props.color] : props.theme.colors.text
}))`
`;

export const Ionicons = styled(_Ionicons).attrs((props) => ({
	color: props.color ? props.theme.colors[props.color] : props.theme.colors.text
}))`
`;
