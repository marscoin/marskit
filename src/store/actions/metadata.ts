import actions from './actions';
import { ok, Result } from '../../utils/result';
import { getDispatch } from '../helpers';

const dispatch = getDispatch();

/*
 * This action updates transactions tags
 */
export const updateMetaTxTags = (
	txid: string,
	tags: Array<string>,
): Result<string> => {
	dispatch({
		type: actions.UPDATE_META_TX_TAGS,
		payload: { txid, tags },
	});
	return ok('');
};

/*
 * This action adds transaction tag
 */
export const addMetaTxTag = (txid: string, tag: string): Result<string> => {
	dispatch({
		type: actions.ADD_META_TX_TAG,
		payload: { txid, tag },
	});
	return ok('');
};

/*
 * This action removes transaction tag
 */
export const deleteMetaTxTag = (txid: string, tag: string): Result<string> => {
	dispatch({
		type: actions.DELETE_META_TX_TAG,
		payload: { txid, tag },
	});
	return ok('');
};
