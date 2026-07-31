import express from 'express'
import { createBusiness, getBusiness } from '../controllers/businessController.js'
import { validateBusinessInput } from '../middleware/validate.js'

const router = express.Router()

router.post('/', validateBusinessInput, createBusiness)
router.get('/:id', getBusiness)

export default router