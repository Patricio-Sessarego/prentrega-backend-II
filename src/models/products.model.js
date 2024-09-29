import { Schema , model } from 'mongoose'
const collectionName = 'products'

const productSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    create: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: Boolean,
        default: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true
    }
})

const productModel = model(collectionName , productSchema)

export default productModel