import productModel from '../../models/products.model.js'
import mongoose from 'mongoose'

class ProductDaosMongo {
    constructor(){
        this.model = productModel
    }

    //GET
    getProduct = async (id) => {
        try{
            if(!mongoose.Types.ObjectId.isValid(id)){
                return -1
            }else{
                const product = await this.model.findOne({ _id: id })
                return product
            }
        }catch(error){
            console.error(error)
        }
    }

    getProducts = async (filter , limit , skip , sort) => {
        try{
            const products = await this.model.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)

            return products
        }catch(error){
            console.error(error)
        }
    }

    getCountedProducts = async (filter) => {
        try{
            const count = await this.model.countDocuments(filter)
            return count
        }catch(error){
            console.error(error)
        }
    }

    //PUT
    updateProduct = async (updatedProduct , id) => {
        try{
            const productToUpdate = await this.getProduct(id)

            if(productToUpdate == -1){
                return -1
            }else if(productToUpdate == null){
                return -2
            }else if(productToUpdate.code != updatedProduct.code){
                return -3
            }else{
                await this.model.updateOne({ _id: productToUpdate._id} , updatedProduct)
                return updatedProduct
            }
        }catch(error){
            console.error(error)
        }
    }

    //POST
    createProduct = async (newProduct) => {
        try{

            if(!newProduct.category || !newProduct.title || !newProduct.price || !newProduct.stock || !newProduct.code){
                return -1
            }

            const products = await this.getProducts()
            const flag = products.some(product => product.code == newProduct.code)

            if(flag){
                return -2
            }else{
                return await this.model.create(newProduct)
            }
        }catch(error){
            console.error(error)
        }
    }

    //DELETE
    deleteProduct = async (id) => {
        try{
            const product = await this.getProduct(id)

            if(product == -1){
                return -1
            }else if(product == null){
                return -2
            }else{
                await this.model.deleteOne({ _id: id })
                return product
            }
        }catch(error){
            console.error(error)
        }
    }
}

export default ProductDaosMongo