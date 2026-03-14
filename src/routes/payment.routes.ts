import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { initializePayment, paystackWebhook, verifyPayment } from '../controllers/payment.controller'

const router = Router()

router.post('/webhook', paystackWebhook)
router.post('/initialize', requireAuth, initializePayment)
router.get('/verify/:reference', requireAuth, verifyPayment)

export default router