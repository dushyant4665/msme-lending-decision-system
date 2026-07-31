import { Redis } from 'ioredis'
import dotenv from 'dotenv'

dotenv.config()

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined
})

export default connection