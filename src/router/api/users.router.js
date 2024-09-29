import UserDaosMongo from '../../daos/MONGO/usersDaos.mongo.js'
import { Router } from 'express'
import passport from 'passport'


const router = Router()
const userService = new UserDaosMongo

//CURRENT
router.get('/current' , passport.authenticate("current" , { session: false }) , async (req , res) => {
    if(!req.user){
        res.status(401).send({status: 'error' , message: 'NO TENES AUTORIZACION PARA ACCEDER A ESTA PAGINA'})
    }else{
        res.status(200).send({status: 'success' , message: 'COOKIE EXTRAIDA CORRECTAMENTE' , data: req.user})
    }
})

//GET
router.get('/' , async (req , res) => {
    try{
        const response = await userService.getUsers()

        if(!response){
            res.status(200).send({status: 'success' , message: 'NO HAY USUARIOS CARGADOS'})
        }else{
            res.status(200).send({status: 'success' , data: response})
        }
    }catch(error){
        console.error(error)
    }
})

router.get('/:email' , async (req , res) => {
    try{
        const { email } = req.params
        const response = await userService.getUser(email)
    
        if(response == -1){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN USUARIO CON ESE EMAIL'})
        }else{
            res.status(200).send({status: 'success' , data: response})
        }
    }catch(error){
        console.error(error)
    }
})

//PUT
router.put('/:email' , async (req , res) => {
    try{
        const { body } = req
        const { email } = req.params
        const response = await userService.updateUser(body , email)

        if(response == -1){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN USUARIO CON ESE EMAIL'})
        }else if(response == -2){
            res.status(400).send({status: 'error' , message: 'NO PUEDE ACTUALIZAR EL ID DEL CARRITO'})
        }else if(response == -3){
            res.status(400).send({status: 'error' , message: 'YA EXISTE UN USUARIO CON EL EMAIL QUE DESEA ACTUALIZAR'})
        }else{
            res.status(200).send({status: 'success' , message: 'USUARIO ACTUALIZADO CORRECTAMENTE' , data: response})
        }
    }catch(error){
        console.error(error)
    }
})

//POST
router.post('/' , async (req , res) => {
    try{
        const { body } = req
        const response = await userService.createUser(body)

        if(response == -1){
            res.status(400).send({ status: 'error' , message: 'LLENE TODOS LOS CAMPOS' })
        }else if(response == -2){
            res.status(400).send({ status: 'error' , message: 'YA EXISTE UN USUARIO CON ESE EMAIL' })
        }else{
            res.status(200).send({ status: 'success' , message: 'USUARIO REGISTRADO CORRECTAMENTE' , data: response })
        }
    }catch(error){
        console.error(error)
    }
})

//DELETE
router.delete('/:email' , async (req , res) => {
    const { email } = req.params
    const response = await userService.deleteUser(email)

    if(response == -1){
        res.status(400).send({status: 'error' , message: 'NO EXISTE UN USUARIO CON ESE EMAIL'})
    }else{
        res.status(200).send({status: 'success' , message: 'USUARIO ELIMINADO CORRECTAMENTE' , data: response})
    }
})

export default router