/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';

import { UserWarning } from './UserWarning';
import { USER_ID, createTodo, deleteTodo, getTodos } from './api/todo';
import { Todo } from './types/Todo';

import { TodoList } from './components/TodoList';
import { NewTodo } from './components/NewTodo';
import { Filter } from './components/Filter';

export const FILTERS = {
  all: 'all',
  completed: 'completed',
  active: 'active',
} as const;

export type FilterType = (typeof FILTERS)[keyof typeof FILTERS];

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>(FILTERS.all);
  const [errorMessage, setErrorMessage] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showError = (message: string) => {
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  const loadTodos = useCallback(async () => {
    try {
      const loadedTodos = await getTodos();

      setTodos(loadedTodos);
    } catch {
      showError('Unable to load todos');
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleAddTodo = async (title: string): Promise<boolean> => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      showError('Title should not be empty');

      return false;
    }

    setIsSubmitting(true);

    setTempTodo({
      id: 0,
      userId: USER_ID,
      title: trimmedTitle,
      completed: false,
    });

    try {
      const newTodo = await createTodo({
        title: trimmedTitle,
        userId: USER_ID,
        completed: false,
      });

      setTodos(prev => [...prev, newTodo]);

      return true;
    } catch {
      showError('Unable to add a todo');

      return false;
    } finally {
      setIsSubmitting(false);
      setTempTodo(null);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    setLoadingIds(prev => [...prev, todoId]);

    try {
      await deleteTodo(todoId);

      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch {
      showError('Unable to delete a todo');
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== todoId));
    }
  };

  const handleClearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    completedTodos.forEach(todo => handleDeleteTodo(todo.id));
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  const visibleTodos = todos.filter(todo => {
    if (filter === FILTERS.active) {
      return !todo.completed;
    }

    if (filter === FILTERS.completed) {
      return todo.completed;
    }

    return true;
  });

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;

  const allTodosCompleted =
    todos.length > 0 && completedTodosCount === todos.length;

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className={classNames('todoapp__toggle-all', {
              active: allTodosCompleted,
            })}
            data-cy="ToggleAllButton"
          />

          <NewTodo onSubmit={handleAddTodo} disabled={isSubmitting} />
        </header>

        {todos.length > 0 || tempTodo ? (
          <>
            <TodoList
              todos={visibleTodos}
              onDelete={handleDeleteTodo}
              loadingIds={loadingIds}
              tempTodo={tempTodo}
            />

            <footer className="todoapp__footer" data-cy="Footer">
              <span className="todo-count" data-cy="TodosCounter">
                {activeTodosCount}
                {activeTodosCount === 1 ? 'item' : 'items'} left
              </span>

              <Filter currentFilter={filter} onFilterChange={setFilter} />

              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
                disabled={completedTodosCount === 0}
                onClick={handleClearCompleted}
              >
                Clear completed
              </button>
            </footer>
          </>
        ) : null}
      </div>

      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification',
          'is-danger',
          'is-light',
          'has-text-weight-normal',
          {
            hidden: !errorMessage,
          },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />

        {errorMessage}
      </div>
    </div>
  );
};
