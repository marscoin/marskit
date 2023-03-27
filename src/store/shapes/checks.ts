import cloneDeep from 'lodash.clonedeep';
import { IChecksContent, IChecksShape } from '../types/checks';
import { arrayTypeItems } from './wallet';

export const defaultChecksContent: IChecksContent = {
	warnings: arrayTypeItems,
};

export const getDefaultChecksContent = (): IChecksContent => {
	return cloneDeep(defaultChecksContent);
};

export const defaultChecksShape: Readonly<IChecksShape> = {};

export const getDefaultChecksShape = (): IChecksShape => {
	return cloneDeep(defaultChecksShape);
};
