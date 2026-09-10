import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { AppModule } from '../../src/app.module'
import { TaskStatus } from '../../src/domain/constants/task-status.enum'
import { Task } from '../../src/domain/model/task.model'
import { TASK_REPOSITORY, TaskRepository } from '../../src/domain/port/repositories/task.repository.interface'

class InMemoryTaskRepository implements TaskRepository {
  public tasks: Task[] = []

  async create(task: Task): Promise<Task> {
    this.tasks.push(task)
    return task
  }
}

describe('POST /api/tasks (E2E)', () => {
  let app: NestFastifyApplication
  let inMemoryRepo: InMemoryTaskRepository
  const VALID_API_KEY = 'my-dev-api-key-123'

  beforeAll(async () => {
    inMemoryRepo = new InMemoryTaskRepository()

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TASK_REPOSITORY)
      .useValue(inMemoryRepo)
      .compile()

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.setGlobalPrefix('api')
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Criação com sucesso (201)', () => {
    it('deve criar uma tarefa com sucesso quando os dados forem válidos', async () => {
      const payload = {
        title: 'Nova Tarefa E2E',
        description: 'Descrição detalhada da tarefa',
        status: TaskStatus.IN_PROGRESS,
      }

      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('x-api-key', VALID_API_KEY)
        .send(payload)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        title: payload.title,
        description: payload.description,
        status: payload.status,
      })
      expect(response.body.id).toBeDefined()
      expect(typeof response.body.id).toBe('string')
      expect(response.body.createdAt).toBeDefined()
      expect(response.body.updatedAt).toBeDefined()
    })

    it('deve criar uma tarefa com status padrão PENDING quando status não for fornecido', async () => {
      const payload = {
        title: 'Tarefa sem status',
      }

      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('x-api-key', VALID_API_KEY)
        .send(payload)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        title: payload.title,
        description: null,
        status: TaskStatus.PENDING,
      })
      expect(response.body.id).toBeDefined()
    })
  })

  describe('Validação de entrada (400)', () => {
    it('deve retornar 400 com VALIDATION_ERROR quando o título tiver menos de 3 caracteres', async () => {
      const response = await request(app.getHttpServer()).post('/api/tasks').set('x-api-key', VALID_API_KEY).send({
        title: 'ab',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
      })
      expect(response.body.details).toBeDefined()
    })

    it('deve retornar 400 com VALIDATION_ERROR quando a descrição exceder 2000 caracteres', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('x-api-key', VALID_API_KEY)
        .send({
          title: 'Tarefa válida',
          description: 'a'.repeat(2001),
        })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
      })
      expect(response.body.details).toBeDefined()
    })

    it('deve retornar 400 com VALIDATION_ERROR quando o status for inválido', async () => {
      const response = await request(app.getHttpServer()).post('/api/tasks').set('x-api-key', VALID_API_KEY).send({
        title: 'Tarefa com status inválido',
        status: 'INVALID_STATUS',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
      })
      expect(response.body.details).toBeDefined()
    })
  })

  describe('Autenticação (401 / 403)', () => {
    it('deve retornar 401 UNAUTHORIZED quando o header x-api-key estiver ausente', async () => {
      const response = await request(app.getHttpServer()).post('/api/tasks').send({
        title: 'Tarefa sem autenticação',
      })

      expect(response.status).toBe(401)
      expect(response.body).toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'API key is required',
      })
    })

    it('deve retornar 403 INVALID_API_KEY quando o header x-api-key for inválido', async () => {
      const response = await request(app.getHttpServer()).post('/api/tasks').set('x-api-key', 'chave-invalida').send({
        title: 'Tarefa com chave errada',
      })

      expect(response.status).toBe(403)
      expect(response.body).toMatchObject({
        code: 'INVALID_API_KEY',
        message: 'API key is invalid',
      })
    })
  })
})
