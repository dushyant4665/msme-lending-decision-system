import express from 'express'
import { createLoanApplication, getLoanApplication } from '../controllers/loanController.js'
import { validateLoanInput } from '../middleware/validate.js'

const router = express.Router()

router.post('/', validateLoanInput, createLoanApplication)
router.get('/:id', getLoanApplication)

export default router