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

      setTodos([...todos, newTodo]);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteTodo(todoId: number) {
    try {
      const response = await fetch(`/api/delete-todo/${todoId}`, {
        method: 'delete'
      });

      if (!response.ok) throw new Error("There was an error deleting this todo");

      await response.json();

      setTodos(todos.filter((todo) => todo.id !== todoId));
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

  return (
    <div id="app">
      <header>
        <div className="container">
          <h1>Flask/React Todo</h1>
          <h2>Have something to do? List it here and never get it done!</h2>
        </div>
      </header>
      <main>
        <form onSubmit={handleNewTodoSubmit}>
          <label>Add todo</label>
          <input
            value={stagedTodoValue}
            onChange={(e) => setStagedTodoValue(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
        <div className="todos-list-container">
          <ul>
            {todos.map((todo) => (
              <li>
                <p>{todo.value}</p>
                <button onClick={() => deleteTodo(todo.id)} type="button">
                  x
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
