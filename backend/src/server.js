import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import businessRoutes from './routes/businessRoutes.js'
import loanRoutes from "./routes/loanRoutes.js"
import decisionRoutes from './routes/decisionRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/business', businessRoutes)
app.use('/api/loan', loanRoutes)
app.use('/api/decision', decisionRoutes)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})

// Start worker in production (Render, Railway, etc)
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  import('./queue/decisionWorker.js').then(() => {
    console.log('decision worker started alongside server')
  })
}