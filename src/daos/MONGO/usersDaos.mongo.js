import { createHash , isValidPassword } from '../../utils/utils.js'
import userModel from '../../models/users.model.js'
import CartDaosMongo from './cartsDaos.mongo.js'

const cartService = new CartDaosMongo

class UserDaosMongo {
    constructor(){
        this.model = userModel
    }

    //GET
    getUser = async (email) => {
        try{
            const user = await this.model.findOne({ email })

            if(!user){
                return -1
            }

            return user
        }catch(error){
            console.error(error)
        }
    }

    getUsers = async () => {
        try{
            const users = await this.model.find({})
            return users
        }catch(error){
            console.error(error)
        }
    }

    //PUT
    updateUser = async (updatedUser , email) => {
        try{
            const userToUpdate = await this.getUser(email)
            if(userToUpdate == -1){
                return -1
            }
    
            if(updatedUser.cart != userToUpdate.cart && updatedUser.cart){
                return -2
            }
    
            if(updatedUser.email){
                const users = await this.getUsers()
                const flag = users.some(user => user.email == updatedUser.email)
    
                if(flag){
                    return -3
                }
            }
            
            if(updatedUser.password){
                updatedUser.password = createHash(updatedUser.password)
            }

            await this.model.updateOne({ _id: userToUpdate._id } , updatedUser)
            return updatedUser
        }catch(error){
            console.error(error)
        }
    }

    //POST
    createUser = async (newUser) => {
        try{
            if(!newUser.first_name || !newUser.last_name || !newUser.password || !newUser.email || !newUser.age){
                return -1
            }
    
            const users = await this.getUsers()
            const flag = users.some(user => user.email == newUser.email)
    
            if(flag){
                return -2
            }
    
            newUser.password = createHash(newUser.password)
            const cart = await cartService.createCart()
            newUser = {
                ...newUser,
                role: "user",
                cart: cart._id,
            }
    
            await this.model.create(newUser)
            return newUser
        }catch(error){
            console.error(error)
        }
    }

    //DELETE
    deleteUser = async (email) => {
        try{
            const user = await this.getUser(email)

            if(user == -1){
                return -1
            }

            await this.model.deleteOne({ email })
            await cartService.deleteCart(user.cart)
            return user
        }catch(error){
            console.error(error)
        }
    }

    //LOGIN
    login = async (email , password) => {
        try{
            const user = await this.getUser(email)

            if(user == -1){
                return -1
            }

            if(!isValidPassword(password , user)){
                return -1
            }

            return user
        }catch(error){
            console.error(error)
        }
    }

    //REGISTER
    register = async (first_name , last_name , password , email , age) => {
        try{
            const user = await this.getUser(email)

            if(user != -1){
                return -1
            }

            const registeredUser = {
                first_name: first_name,
                last_name: last_name,
                password: password,
                email: email,
                age: age
            }
            
            await this.createUser(registeredUser)
            const newUser = this.getUser(email)
            return newUser
        }catch(error){
            console.error(error)
        }
    }
}

export default UserDaosMongo