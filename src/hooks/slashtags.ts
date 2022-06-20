import { createContext, useContext } from 'react';
import { ISlashtagsContext } from '../components/SlashtagsProvider';

export const SlashtagsContext = createContext<ISlashtagsContext | {}>({});

export const useSlashtags = (): Partial<ISlashtagsContext> => {
	const context = useContext(SlashtagsContext);
	return context;
};
