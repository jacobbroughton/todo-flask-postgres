from flask import Flask, request
import os
import psycopg2 as pg
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
database = os.getenv("DATABASE_NAME")
user = os.getenv("DATABASE_USER")
password = os.getenv("DATABASE_PASSWORD")
host = os.getenv("DATABASE_HOST")
port = os.getenv("DATABASE_PORT")

CREATE_TODOS_TABLE = (
  """create table if not exists todos (
    id serial primary key,
    value text not null,
    is_complete boolean default false,
    is_deleted boolean default false,
    created_at timestamptz not null default now(),
    modified_at timestamptz null
  );"""
)

GET_ALL_TODOS = "SELECT * FROM todos WHERE is_deleted = false;"

ADD_TODO = (
  """INSERT INTO todos (
    value
  ) values (%s) returning *;"""
)

DELETE_TODO = (
  """UPDATE todos
  SET is_deleted = true
  where id = %s"""
)

connection = pg.connect(host=host, user=user, password=password, database=database)

@app.route('/api/get-all-todos')
def getAllTodos():
  with connection:
    with connection.cursor(cursor_factory=RealDictCursor) as cursor:
      cursor.execute(CREATE_TODOS_TABLE)
      cursor.execute(GET_ALL_TODOS)
      todos = cursor.fetchall()

  return {"todos": todos, "message": "Successfully fetched all todos"}

@app.post('/api/add-todo')
def addTodo():
  body = request.get_json()
  print("body: ", body)

  with connection:
    with connection.cursor(cursor_factory=RealDictCursor) as cursor:
      cursor.execute(ADD_TODO, (body["todoValue"], ))
      newTodo = cursor.fetchone()
      return {"newTodo": newTodo, "message": "Todo successfully added"}
    
@app.delete('/api/delete-todo/<todoIdToDelete>')
def deleteTodo(todoIdToDelete):
  with connection:
    with connection.cursor(cursor_factory=RealDictCursor) as cursor:
      cursor.execute(DELETE_TODO, (todoIdToDelete,))
  return {"message": "Delete this todo: %s" % todoIdToDelete}


if (__name__)== '__main__':
  app.run(debug=True)