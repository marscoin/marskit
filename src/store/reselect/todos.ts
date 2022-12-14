import Store from '../types';
import { ITodos } from '../types/todos';

export const todosSelector = (state: Store): ITodos => state.todos;
