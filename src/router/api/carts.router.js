import CartDaosMongo from '../../daos/MONGO/cartsDaos.mongo.js'
import { Router } from 'express'

const router = Router()
const cartService = new CartDaosMongo

//GET
router.get('/:cid' , async (req , res) => {
    try{
        const { cid } = req.params
        const cart = await cartService.getCart(cid)

        if(cart == -1){
            res.status(400).send({status: 'error' , message: 'ID INVALIDO'})
        }else if(cart == null){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN CARRITO CON ESE ID'})
        }else{
            res.status(200).send({status: 'success' , data: cart })
        }
    }catch(error){
        console.error(error)
    }
})

//PUT
router.put('/:cid/products/:pid' , async (req , res) => {
    try{
        const { body } = req
        const { cid , pid } = req.params
        const response = await cartService.updateProductQuantity(cid , pid , body.quantity)

        if(response == -1){
            res.status(400).send({status: 'error' , message: 'ID DE CARRITO INVALIDO'})
        }else if(response == -2){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN CARRITO CON ESE ID'})
        }else if(response == -3){
            res.status(400).send({status: 'error' , message: 'ID DE PRODUCTO INVALIDO'})
        }else if(response == -4){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN PRODUCTO CON ESE ID'})
        }else if(response == -5){
            res.status(400).send({status: 'error' , message: 'ENVIE EL VALOR DE CANTIDAD PARA ACTUALIZAR'})
        }else if(response == -6){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN PRODUCTO CON ESE ID EN EL CARRITO'})
        }else{
            res.status(200).send({status: 'success' , message: 'CANTIDAD DEL PRODUCTO ACTUALIZADA CORRECTAMENTE' , data: response})
        }
    }catch(error){
        console.error(error)
    }
})

router.put('/:cid' , async (req , res) => {
    try{
        const { body } = req
        const { cid } = req.params
        const response = await cartService.updateCart(cid , body)

        if(response == -1){
            res.status(400).send({status: 'error' , message: 'ID DE CARRITO INVALIDO'})
        }else if(response == -2){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN CARRITO CON ESE ID'})
        }else if(response == -3){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN PRODUCTO CON ESE ID'})
        }else if(response == -4){
            res.status(400).send({status: 'error' , message: 'UNO O MAS PRODUCTOS ESTAN REPETIDOS'})
        }else if(response == -5){
            res.status(400).send({status: 'error' , message: 'FALTAN LLENAR UNO O MAS CAMPOS DE LOS PRODUCTOS'})
        }else{
            res.status(200).send({status: 'success' , message: 'CARRITO ACTUALIZADO CORRECTAMENTE' , data: response})
        }
    }catch(error){
        console.error(error)
    }
})

//POST
router.post('/' , async (req , res) => {
    try{
        const cart = await cartService.createCart()
        res.status(200).send({status: 'success' , message: 'CARRITO CREADO CORRECTAMENTE' , data: cart})
    }catch(error){
        console.error(error)
    }
})

router.post('/:cid/products/:pid' , async (req , res) => {
    try{
        const { body } = req
        const { cid , pid } = req.params
        const response = await cartService.createProductCart(cid , pid , body.quantity)

        if(response == -1){
            res.status(400).send({status: 'error' , message: 'ID DE CARRITO INVALIDO'})
        }else if(response == -2){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN CARRITO CON ESE ID'})
        }else if(response == -3){
            res.status(400).send({status: 'error' , message: 'ID DE PRODUCTO INVALIDO'})
        }else if(response == -4){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN PRODUCTO CON ESE ID'})
        }else{
            res.status(200).send({status: 'success' , message: 'PRODUCTO AGREGADO AL CARRITO CORRECTAMENTE' , data: response})
        }
    }catch(error){
        console.error(error)
    }
})

//DELETE
router.delete('/:cid' , async (req , res) => {
    try{
        const { cid } = req.params
        const response = await cartService.deleteAllProductsFromCart(cid)

        if(response == -1){
            res.status(400).send({status: 'error' , message: 'ID DE CARRITO INVALIDO'})
        }else if(response == -2){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN CARRITO CON ESE ID'})
        }else{
            res.status(200).send({status: 'success' , message: 'CARRITO VACIADO CORRECTAMENTE' , data: response})
        }
    }catch(error){
        console.error(error)
    }
})

router.delete('/:cid/products/:pid' , async (req , res) => {
    try{
        const { cid , pid } = req.params
        const response = await cartService.deleteProductCart(cid , pid)

        if(response == -1){
            res.status(400).send({status: 'error' , message: 'ID DE CARRITO INVALIDO'})
        }else if(response == -2){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN CARRITO CON ESE ID'})
        }else if(response == -3){
            res.status(400).send({status: 'error' , message: 'ID DE PRODUCTO INVALIDO'})
        }else if(response == -4){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN PRODUCTO CON ESE ID'})
        }else if(response == -5){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN PRODUCTO CON ESE ID EN EL CARRITO'})
        }else{
            res.status(200).send({status: 'success' , message: 'PRODUCTO ELIMINADO DEL CARRITO CORRECTAMENTE' , data: response})
        }
    }catch(error){
        console.error(error)
    }
})

export default router