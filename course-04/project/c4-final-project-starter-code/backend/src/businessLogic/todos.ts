import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)

  return todoAccess.getAllTodos(userId)
}

export async function getTodo(todoId: string, jwtToken: string) {
  const userId = parseUserId(jwtToken)

  return todoAccess.getTodo(todoId, userId)
}

export async function createTodo(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)
  const createdAt = new Date().toISOString()
  const newItem = {
    todoId,
    userId,
    createdAt,
    done: false,
    ...createTodoRequest
  }

  return await todoAccess.createTodo(newItem)
}

export async function deleteTodo(todoId: string, jwtToken: string) {
  const userId = parseUserId(jwtToken)

  return await todoAccess.deleteTodo(todoId, userId)
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, jwtToken: string, todoId: string) {
  const userId = parseUserId(jwtToken)

  return await todoAccess.updateTodo(updateTodoRequest, todoId, userId)
}

export async function updateTodoAttachement(jwtToken: string, todoId: string) {
  const userId = parseUserId(jwtToken)

  return await todoAccess.updateTodoAttachement(todoId, userId)
}

export async function getUploadUrl(todoId: string) {
  return await todoAccess.getUploadUrl(todoId)
}
