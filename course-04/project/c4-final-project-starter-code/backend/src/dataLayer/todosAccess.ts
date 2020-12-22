import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todoIndex = process.env.INDEX_NAME,
    private readonly s3 = new AWS.S3({signatureVersion: 'v4'}),
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = 300) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos')

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
      .then(data => console.log(data.Attributes))
      .catch(console.error)

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

    console.log('Get todo: ', result)
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
      .then(data => console.log(data.Attributes))
      .catch(console.error)

    return updatedTodo
  }

  async updateTodoAttachement(todoId: string, userId: string) {
    await this.docClient.update({
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
      .then(data => console.log(data.Attributes))
      .catch(console.error)
  }

  async getUploadUrl(todoId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
}
