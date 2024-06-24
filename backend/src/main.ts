import bodyParser from 'body-parser'
import compression from 'compression'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import basicAuth from 'express-basic-auth'
import fs from 'fs'
import morgan from 'morgan'
import path from 'path'
import 'source-map-support/register'

import { PORT, STATIC_FILE_ROOT, USERS } from '@/config'
import { closeDatabase, getAppDataSource } from '@/db'
import { sendMsgLog } from '@/helpers/logging'
import { apiErrorHandler, shouldLoggerSkip, timeoutCheck } from '@/helpers/middleware'
import { articlesRouter } from '@/routes/articles'
import { clientsRouter } from '@/routes/clients'
import { documentsRouter } from '@/routes/documents'
import { ordersRouter } from '@/routes/orders'

function configureServer() {
  const app = express()

  app.use(
    basicAuth({
      challenge: true,
      realm: 'scaffolding',
      users: Object.entries(USERS).reduce(
        (acc, [name, { password }]) => {
          acc[name] = password
          return acc
        },
        {} as Record<string, string>,
      ),
    }),
  )

  app.use(
    morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms', {
      skip: shouldLoggerSkip,
    }),
  )
  app.use(cors())
  app.use(timeoutCheck)
  app.use(compression())
  app.use(bodyParser.json({ limit: '5mb' }))
  app.use(bodyParser.text({ type: 'text/plain', limit: '1mb' }))
  app.use(bodyParser.text({ type: 'text/html', limit: '3mb' }))
  app.use(express.static(STATIC_FILE_ROOT))

  app.set('port', PORT)

  app.get('/manifest.json', (_: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/manifest+json')
    res.sendFile(path.resolve('./manifest.webmanifest'))
  })

  app.get('/health', (_: express.Request, res: express.Response) => {
    res.status(200).send('OK')
  })

  app.use('/api/clients', clientsRouter)
  app.use('/api/orders', ordersRouter)
  app.use('/api/articles', articlesRouter)
  app.use('/api/documents', documentsRouter)
  app.use(apiErrorHandler)

  return app
}

async function main() {
  sendMsgLog('Starting application')
  await getAppDataSource()

  try {
    try {
      fs.mkdirSync('./temp')
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
    const app = configureServer()

    app.listen(app.get('port'), () => {
      sendMsgLog(
        `Node app started on http://127.0.0.1:${app.get('port')} as ${process.env.NODE_ENV}`,
      )
    })
  } catch (error) {
    await closeDatabase()
    throw error
  }
}

main().catch((err) => sendMsgLog(`Closing due to error: ${err}`))
