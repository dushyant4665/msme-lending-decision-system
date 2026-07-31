import { Worker } from 'bullmq'
import connection from './connection.js'
import prisma from '../db.js'
import { runDecisionEngine } from '../services/decisionEngine.js'

const worker = new Worker(
  'decision-processing',
  async (job) => {
    const { loanId } = job.data

    const loan = await prisma.loanApplication.findUnique({
      where: { id: loanId },
      include: { business: true }
    })

    if (!loan) {
      throw new Error('loan not found')
    }

    const result = runDecisionEngine(loan.business, loan)

    const decision = await prisma.$transaction(async (tx) => {
      const createdDecision = await tx.decision.create({
        data: {
          loanId,
          approved: result.approved,
          creditScore: result.creditScore,
          reasonCodes: result.reasonCodes.join(',')
        }
      })

      await tx.loanApplication.update({
        where: { id: loanId },
        data: { status: result.approved ? 'approved' : 'rejected' }
      })

      await tx.auditLog.create({
        data: {
          action: 'DECISION_GENERATED',
          details: `Loan ${loanId} scored ${result.creditScore}`
        }
      })

      return createdDecision
    })

    return decision
  },
  { connection }
)

worker.on('failed', (job, err) => {
  console.log(`job ${job.id} failed: ${err.message}`)
})

export default worker