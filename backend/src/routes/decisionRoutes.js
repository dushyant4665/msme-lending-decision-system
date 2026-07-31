import express from 'express'
import { generateDecision, getDecisionStatus } from '../controllers/descisionController.js'

const router = express.Router()

router.post('/:loanId', generateDecision)
router.get('/:loanId/status', getDecisionStatus)

export default router