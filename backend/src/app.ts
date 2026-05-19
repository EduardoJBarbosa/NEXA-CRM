import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import routes from './routes/index.js'

const app: Express = express()

app.use(cors())
app.use(express.json())

app.use('/api', routes)

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'CRM API running' })
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  })
})

export default app
