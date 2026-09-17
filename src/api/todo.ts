import { Todo } from '../types/Todo';

const BASE_URL = 'https://mate.academy/students-api';

export const USER_ID = 12345;

export const getTodos = async (): Promise<Todo[]> => {
  const response = await fetch(`${BASE_URL}/todos?userId=${USER_ID}`);

  return response.json();
};

export const createTodo = async ({
  title,
  userId,
  completed,
}: Omit<Todo, 'id'>): Promise<Todo> => {
  const response = await fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, userId, completed }),
  });

  return response.json();
};

export const deleteTodo = async (todoId: number): Promise<void> => {
  await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: 'DELETE',
  });
};
