import { Router } from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart
} from '../controllers/cart.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

router.use(requireAuth) 

router.get('/', getCart)
router.post('/', addToCart)
router.post('/merge', requireAuth, mergeCart)
router.patch('/:variantId', updateCartItem)
router.delete('/:variantId', removeFromCart)
router.delete('/', clearCart)

export default router