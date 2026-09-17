import React, { useState, useRef, useEffect } from 'react';

type Props = {
  onSubmit: (title: string) => Promise<boolean>;
  disabled: boolean;
};

export const NewTodo: React.FC<Props> = ({ onSubmit, disabled }) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      await onSubmit(title);
      if (inputRef.current) {
        inputRef.current.focus();
      }

      return;
    }

    const success = await onSubmit(title);

    if (success) {
      setTitle('');
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        data-cy="NewTodoField"
        type="text"
        className="todoapp__new-todo"
        placeholder="What needs to be done?"
        value={title}
        onChange={event => setTitle(event.target.value)}
        disabled={disabled}
        autoFocus
      />
    </form>
  );
};
