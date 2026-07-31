import prisma from '../db.js'
import { decisionQueue } from '../queue/decisionQueue.js'

export const generateDecision = async (req, res) => {
  const { loanId } = req.params

  try {
    const loan = await prisma.loanApplication.findUnique({ where: { id: loanId } })
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan application not found' })
    }

    const existing = await prisma.decision.findUnique({ where: { loanId } })
    if (existing) {
      return res.status(409).json({ success: false, message: 'Decision already exists for this loan' })
    }

    const job = await decisionQueue.add('score-loan', { loanId })

    res.status(202).json({
      success: true,
      message: 'Decision is being processed',
      jobId: job.id,
      loanId
    })
  } catch (err) {
    console.error('decision queue error:', err)
    res.status(500).json({ success: false, message: 'Failed to queue decision' })
  }
}

export const getDecisionStatus = async (req, res) => {
  const { loanId } = req.params

  try {
    const decision = await prisma.decision.findUnique({ where: { loanId } })

    if (!decision) {
      return res.status(200).json({ success: true, status: 'processing', data: null })
    }

    res.status(200).json({ success: true, status: 'completed', data: decision })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch decision status' })
  }
}