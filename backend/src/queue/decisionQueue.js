import { Queue } from 'bullmq'
import connection from './connection.js'

export const decisionQueue = new Queue('decision-processing', { connection })