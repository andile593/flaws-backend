import { Router } from 'express'
import { joinWaitlist, getWaitlistEntries } from '../controllers/waitlist.controller'
 
const router = Router()
 
router.post('/', joinWaitlist)
router.get('/', getWaitlistEntries) // protect with admin middleware if needed
 
export default router
 