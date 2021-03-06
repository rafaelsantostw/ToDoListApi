const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);
  
  if(!user) {
    return response.status(400).json({ error: "Username not found!"});
  }
  
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const checksExistsUserAccount = users.some(
    (user) => user.username === username
  )

  if(checksExistsUserAccount) {
    return response.status(400).json({ error: "Username already exists!"});
  }

  const userOperation = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(userOperation)

  return response.status(201).json(userOperation);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todosOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline), 
	  created_at: new Date()
  }

  user.todos.push(todosOperation)

  return response.status(201).json(todosOperation)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const userTodo = user.todos.find(todo => todo.id === id)

  if(!userTodo){
    response.status(404).json({ error: "Todo id not found!"});
  }

  userTodo.title = title
  userTodo.deadline = deadline
  
  response.status(201).json(userTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const userTodo = user.todos.find(todo => todo.id === id)

  if(!userTodo){
    response.status(404).json({ error: "Todo id not found!"});
  }

  userTodo.done = true
  response.status(200).json(userTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const userTodoIndex = user.todos.findIndex(todo => todo.id === id)

  if(userTodoIndex === -1){
    response.status(404).json({ error: "Todo id not found!"});
  }

  user.todos.splice(userTodoIndex, 1)

  response.status(204).json()
});

module.exports = app;