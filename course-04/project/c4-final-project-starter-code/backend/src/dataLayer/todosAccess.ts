import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('todosAccess')
const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todoIndex = process.env.INDEX_NAME,
    private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = 300) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todoIndex,
      KeyConditionExpression: '#userId = :userId',
      ExpressionAttributeNames: {
          '#userId': 'userId'
      },
      ExpressionAttributeValues: {
          ':userId': userId
      }
    })
    .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('creating a todo')

    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async deleteTodo(todoId: string, userId: string) {
    const todo = await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }}).promise()

    logger.info('deleting a todo', { result: todo })

    return todo
  }

  async getTodo(todoId: string, userId: string) {
    const result = await this.docClient
    .get({
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    })
    .promise()

    logger.info('Get todo', { result: result })
    return !!result.Item
  }

  async updateTodo(todo: TodoUpdate, todoId: string, userId: string) {
    const updatedTodo = await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      ExpressionAttributeNames: {"#name": "name"},
      UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeValues: {
        ":name": todo.name,
        ":dueDate": todo.dueDate,
        ":done": todo.done
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()

    logger.info('updating a todo', { result: updatedTodo })

    return updatedTodo
  }

  async updateTodoAttachement(todoId: string, userId: string) {
    const todoAttchement = await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()

    logger.info('updating a todo', { result: todoAttchement })
  }

  async getUploadUrl(todoId: string) {
    logger.info('getting uploadUrl')

    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
}
