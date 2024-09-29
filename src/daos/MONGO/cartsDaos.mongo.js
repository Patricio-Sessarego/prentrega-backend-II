import ProductDaosMongo from './productsDaos.mongo.js'
import cartModel from '../../models/carts.model.js'
import mongoose  from 'mongoose'

const productService = new ProductDaosMongo

class CartDaosMongo {
    constructor(){
        this.model = cartModel
    }

    //GET
    getCart = async (id) => {
        try{
            if(!mongoose.Types.ObjectId.isValid(id)){
                return -1
            }else{
                const cart = await this.model.findOne({ _id: id })
                return cart
            }
        }catch(error){
            console.error(error)
        }
    }

    //PUT
    updateCart = async (cid , newProducts) => {
        try{
            let cart = await this.getCart(cid)

            if(cart == -1){
                return -1
            }else if(cart == null){
                return -2
            }

            let noProduct = false
            let dupProduct = false
            let missingData = false
            const seenProducts = new Set()
            for(const product of newProducts){
                let prod = await productService.getProduct(product._id.toString())
                if(prod == -1 || prod == -2){
                    noProduct = true
                }

                if(!product._id){
                    missingData = true
                }

                if(!product.quantity){
                    product.quantity = 1
                }

                if(seenProducts.has(product._id.toString())){
                    dupProduct = true
                }

                seenProducts.add(product._id.toString())
            }

            if(noProduct){
                return -3
            }else if(dupProduct){
                return -4
            }else if(missingData){
                return -5
            }

            await this.deleteAllProductsFromCart(cid)
            const updatedCart = await this.getCart(cid)

            newProducts.forEach((product) => {
                updatedCart.products.push({ product: product._id , quantity: product.quantity})
            })

            await this.model.updateOne({ _id: updatedCart.id } , updatedCart)
            return updatedCart
        }catch(error){
            console.error(error)
        }
    }

    updateProductQuantity = async (cid , pid , quantity) => {
        try{
            const cart = await this.getCart(cid)
            const product = await productService.getProduct(pid)

            if(cart == -1){
                return -1
            }else if(cart == null){
                return -2
            }

            if(product == -1){
                return -3
            }else if(product == null){
                return -4
            }

            if(!quantity){
                return -5
            }

            let found = false
            for(let i = 0; i < cart.products.length; i++){
                if(cart.products[i].product._id.toString() == pid){
                    found = true
                    cart.products[i].quantity = quantity
                }
            }

            if(!found){
                return -6
            }

            await this.model.updateOne({ _id: cart._id } , cart)
            return cart
        }catch(error){
            console.error(error)
        }
    }

    //POST
    createCart = async () => {
        try{
            const cart = await this.model.create({})
            return cart
        }catch(error){
            console.error(error)
        }
    }

    createProductCart = async (cid , pid , quantity) => {
        try{
            const cart = await this.getCart(cid)
            const product = await productService.getProduct(pid)

            if(cart == -1){
                return -1
            }else if(cart == null){
                return -2
            }

            if(product == -1){
                return -3
            }else if(product == null){
                return -4
            }

            if(!quantity){
                quantity = 1
            }
            
            let isDup = false
            for(let i = 0; i < cart.products.length; i++){
                if(cart.products[i].product._id.toString() == pid){
                    isDup = true
                    cart.products[i].quantity++
                }
            }

            if(isDup){
                await this.model.updateOne({ _id: cart.id } , cart)
                return 'YA EXISTE EL PRODUCTO EN EL CARRITO, SE AGREGO 1 ITEM MAS DEL PRODUCTO'
            }else{
                cart.products.push({ product: product._id , quantity: quantity})
                await this.model.updateOne({ _id: cart.id } , cart)
                return product
            }
        }catch(error){
            console.error(error)
        }
    }

    //DELETE
    deleteCart = async (cid) => {
        try{
            const cart = await this.getCart(cid)

            if(cart == -1){
                return -1
            }

            if(cart == null){
                return -2
            }

            return await this.model.deleteOne({ _id: cid })
        }catch(error){
            console.error(error)
        }
    }

    deleteAllProductsFromCart = async (cid) => {
        try{
            const cart = await this.getCart(cid)

            if(cart == -1){
                return -1
            }else if(cart == -null){
                return -2
            }

            await this.model.updateOne({ _id: cart._id } , { $set: { products: [] } })
            return cart
        }catch(error){
            console.error(error)
        }
    }

    deleteProductCart = async (cid , pid) => {
        try{
            const cart = await this.getCart(cid)
            const product = await productService.getProduct(pid)

            if(cart == -1){
                return -1
            }else if(cart == null){
                return -2
            }

            if(product == -1){
                return -3
            }else if(product == null){
                return -4
            }

            let found = false
            for(let i = 0; i < cart.products.length; i++){
                if(cart.products[i].product._id.toString() == pid){
                    found = true
                }
            }

            if(found){
                const updatedProducts = cart.products.filter(product => product.product._id.toString() !== pid)
                await this.model.updateOne({ _id: cart.id } , { $set: { products: updatedProducts } })
                return product
            }else{
                return -5
            }
        }catch(error){
            console.error(error)
        }
    }
}

export default CartDaosMongo