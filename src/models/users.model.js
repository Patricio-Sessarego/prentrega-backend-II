import { Schema , model } from 'mongoose'
const collectionName = 'users'

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'carts'
    },
    role: {
        type: String,
        required: true,
        default: "user",
        enum: ["user" , "admin"]
    },
    age: {
        type: Number,
        required: true
    }
})

//POPULATION
userSchema.pre('findOne' , function(){
    this.populate('cart')
})

const userModel = model(collectionName , userSchema)

export default userModel