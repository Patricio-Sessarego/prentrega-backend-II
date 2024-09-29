import ProductDaosMongo from '../../daos/MONGO/productsDaos.mongo.js'
import { Router } from 'express'

const router = Router()
const productService = new ProductDaosMongo

//GET
router.get('/' , async (req , res) => {
    try{
        const { limit = 9 , page = 1 , sort , category , available } = req.query

        const limitInt = isNaN(parseInt(limit)) ? 9 : parseInt(limit)
        const pageInt = isNaN(parseInt(page)) ? 1 : parseInt(page)

        let filter = {}
        if(category){
            filter.category = category
        }

        if(available){
            filter.stock = { $gt: 0 }
        }

        let sortObj = {}
        if(sort === 'asc'){
            sortObj = { price: 1 }
        }else if(sort === 'desc'){
            sortObj = { price: -1 }
        }

        let products = await productService.getProducts(filter , limitInt , (pageInt -1) * limitInt , sortObj)
        const totalProducts = await productService.getProducts(filter)
        const totalPages = Math.ceil(totalProducts / limitInt)

        const response = {
            status: 'success',
            payload: products,
            currentPage: pageInt,
            totalPages: totalPages,
            hasPrevPage: pageInt > 1,
            hasNextPage: pageInt < totalPages,
            prevPage: pageInt > 1 ? pageInt - 1 : null,
            nextPage: pageInt < totalPages ? pageInt + 1 : null,
            prevLink: pageInt > 1 ? `/api/products/?limit=${limitInt}&page=${pageInt - 1}${sort ? `&sort=${sort}` : ''}${category ? `&category=${category}` : ``}${available ? `&available=${available}` : ''}` : null,
            nextLink: pageInt < totalPages ? `/api/products/?limit=${limitInt}&page=${pageInt + 1}${sort ? `&sort=${sort}` : ''}${category ? `&category=${category}` : ``}${available ? `&available=${available}` : ''}` : null
        }

        res.status(200).send(response)
    }catch(error){
        console.error(error)
        res.status(500).send({status: 'error' , message: 'ERROR DEL SERVIDOR'})
    }
})

router.get('/:pid' , async (req , res) => {
    try{
        const { pid } = req.params
        const product = await productService.getProduct(pid)

        if(product == -1){
            res.status(400).send({status: 'error' , message: 'ID INVALIDO'})
        }else if(product == null){
            res.status(400).send({status: 'error' , message: 'NO EXISTE UN PRODUCTO CON ESE ID'})
        }else{
            res.status(200).send({status: 'success' , data: product})
        }
    }catch(error){
        console.error(error)
        res.status(500).send({status: 'error' , message: 'ERROR DEL SERVIDOR'})
    }
})

//PUT
router.put('/:pid' , async (req , res) => {
    try{
        const { body } = req
        const { pid } = req.params
        const response = await productService.updateProduct(body , pid)
        
        if(response == -1){
            res.status(400).send({ status: 'error' , message: 'ID INVALIDO' })
        }else if(response == -2){
            res.status(400).send({ status: 'error' , message: 'NO EXISTE UN PRODUCTO CON ESE ID'})
        }else if(response == -3){
            res.status(400).send({status: 'error' , message: 'NO PUEDE ACTUALIZAR EL CODE DEL PRODUCTO'})
        }else{
            res.status(200).send({ status: 'success' , message: 'PRODUCTO ACTUALIZADO' , data: response})
        }
    }catch(error){
        console.error(error)
        res.status(500).send({status: 'error' , message: 'ERROR DEL SERVIDOR'})
    }
})

//POST
router.post('/' , async (req , res) => {
    try{
        const { body } = req
        const response = await productService.createProduct(body)

        if(response == -1){
            res.status(400).send({ status: 'error' , message: 'LLENE TODOS LOS CAMPOS' })
        }else if(response == -2){
            res.status(400).send({ status: 'error' , message: 'YA EXISTE UN PRODUCTO CON ESE CODIGO' })
        }else{
            res.status(200).send({status: 'success' , message: 'PRODUCTO REGISTRADO' , data: response})
        }
    }catch(error){
        console.error(error)
        res.status(500).send({status: 'error' , message: 'ERROR DEL SERVIDOR'})
    }
})

//DELETE
router.delete('/:pid' , async (req , res) => {
    try{
        const { pid } = req.params
        const response = await productService.deleteProduct(pid)

        if(response == -1){
            res.status(400).send({ status: 'error' , message: 'ID INVALIDO' })
        }else if(response == -2){
            res.status(400).send({ status: 'error' , message: 'NO EXISTE UN PRODUCTO CON ESE ID'})
        }else{
            res.status(200).send({ status: 'success' , message: 'PRODUCTO ELIMINADO' , data: response})
        }
    }catch(error){
        console.error(error)
        res.status(500).send({status: 'error' , message: 'ERROR DEL SERVIDOR'})
    }
})

export default router