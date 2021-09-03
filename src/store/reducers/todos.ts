import actions from '../actions/actions';
import { ITodos } from '../types/todos';
import { defaultTodosShape } from '../shapes/todos';

const todos = (state = defaultTodosShape, action): ITodos => {
	switch (action.type) {
		case actions.ADD_TODO:
			return {
				...state,
				todos: [...state.todos, action.payload],
			};

		case actions.REMOVE_TODO:
			const id = action.payload;
			return {
				...state,
				todos: state.todos.filter((todo) => todo.id !== id),
			};

		case actions.DISMISS_TODO:
			return {
				...state,
				dismissedTodos: [...state.dismissedTodos, action.payload],
			};

		default:
			return state;
	}
};

export default todos;
