import productRouter from './api/products.router.js'
import cartRouter from './api/carts.router.js'
import userRouter from './api/users.router.js'
import viewRouter from './api/views.router.js'
import { Router } from 'express'
const router = Router()

router.use('/' , viewRouter)
router.use('/api/carts' , cartRouter)
router.use('/api/sessions' , userRouter)
router.use('/api/products' , productRouter)

export default router