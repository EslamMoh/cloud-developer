import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'

const logger = createLogger('todos')
const todoAccess = new TodoAccess()

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  logger.info('Getting all todos')

  const userId = parseUserId(jwtToken)

  return todoAccess.getAllTodos(userId)
}

export async function getTodo(todoId: string, jwtToken: string) {
  logger.info('Getting a todo', { todoId: todoId })

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

  logger.info('creating a todo', { todo: newItem })
  return await todoAccess.createTodo(newItem)
}

export async function deleteTodo(todoId: string, jwtToken: string) {
  logger.info('deleting a todo', { todoId: todoId })
  const userId = parseUserId(jwtToken)

  return await todoAccess.deleteTodo(todoId, userId)
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, jwtToken: string, todoId: string) {
  logger.info('updating a todo', { todoId: todoId, updateTodoRequest: updateTodoRequest })
  const userId = parseUserId(jwtToken)

  return await todoAccess.updateTodo(updateTodoRequest, todoId, userId)
}

export async function updateTodoAttachement(jwtToken: string, todoId: string) {
  logger.info('updating a todo attachement', { todoId: todoId })
  const userId = parseUserId(jwtToken)

  return await todoAccess.updateTodoAttachement(todoId, userId)
}

export async function getUploadUrl(todoId: string) {
  logger.info('getting a todo uploadUrl', { todoId: todoId })

  return await todoAccess.getUploadUrl(todoId)
}
