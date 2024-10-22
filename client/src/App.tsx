import { useEffect, useState } from "react";

type TodoType = {
  id: number;
  value: string;
  is_complete: boolean;
  is_deleted: boolean;
  created_at: string;
  modified_at: string | null;
};

export function App() {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [stagedTodoValue, setStagedTodoValue] = useState("");

  async function handleNewTodoSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/add-todo", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          todoValue: stagedTodoValue,
        }),
      });

      if (!response.ok) throw new Error("There was an error adding the todo");

      const { newTodo } = await response.json();

      console.log(newTodo);

      setStagedTodoValue("");
      setTodos([...todos, newTodo]);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteTodo(todoId: number) {
    try {
      const response = await fetch(`/api/delete-todo/${todoId}`, {
        method: "delete",
      });

      if (!response.ok) throw new Error("There was an error deleting this todo");

      await response.json();

      setTodos(todos.filter((todo) => todo.id !== todoId));
    } catch (error) {
      console.error(error);
    }
  }

  async function completeTodo(todoId: number) {
    try {
      const response = await fetch(`/api/complete-todo/${todoId}`, {
        method: "put",
      });

      if (!response.ok) throw new Error("There was an error marking this todo completed");

      await response.json();

      setTodos(
        todos.map((todo) => ({
          ...todo,
          ...(todo.id === todoId && { is_complete: true }),
        }))
      );
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    async function getAllTodos() {
      try {
        const response = await fetch("/api/get-all-todos");

        if (!response.ok) throw new Error("There was an error fetching all todos");

        const data = await response.json();

        setTodos(data.todos);
      } catch (error) {
        console.error(error);
      }
    }
    getAllTodos();
  }, []);

  const activeTodos = todos.filter((todo) => !todo.is_complete && !todo.is_deleted);

  const completedTodos = todos.filter((todo) => todo.is_complete && !todo.is_deleted);

  return (
    <div id="app">
      <header>
        <div className="container">
          <h1>Flask/React Todo</h1>
          <h2>Have something to do? List it here and never get it done!</h2>
        </div>
      </header>
      <main>
        <form onSubmit={handleNewTodoSubmit} className="new-todo">
          <label>Add todo</label>
          <input
            placeholder="Enter your new todo"
            value={stagedTodoValue}
            onChange={(e) => setStagedTodoValue(e.target.value)}
          />
          <button type="submit" disabled={stagedTodoValue === ""}>
            Submit
          </button>
        </form>
        <div className="todos-list-container">
          <p>To-do</p>
          <ul>
            {activeTodos.length ? (
              activeTodos.map((todo) => (
                <li>
                  <p>{todo.value}</p>
                  <div className="buttons">
                    <button
                      onClick={() => completeTodo(todo.id)}
                      type="button"
                      className="complete"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="delete"
                      type="button"
                    >
                      x
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li>
                <p className="none-message">No completed todos</p>
              </li>
            )}
          </ul>
        </div>

        <div className="todos-list-container">
          <p>Completed</p>
          <ul>
            {completedTodos.length ? (
              completedTodos.map((todo) => (
                <li>
                  <p>{todo.value}</p>
                  <div className="buttons">
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      type="button"
                      className="delete"
                    >
                      x
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li>
                <p className="none-message">No completed todos</p>
              </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
