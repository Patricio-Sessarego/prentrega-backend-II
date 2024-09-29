import ProductDaosMongo from '../../daos/MONGO/productsDaos.mongo.js'
import CartDaosMongo from '../../daos/MONGO/cartsDaos.mongo.js'
import UserDaosMongo from '../../daos/MONGO/usersDaos.mongo.js'
import { Router } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'

const productService = new ProductDaosMongo
const cartService = new CartDaosMongo
const userService = new UserDaosMongo
const router = Router()

//HOME
router.get('/' , (req , res , next) => {
    try{
        passport.authenticate("current" , { session: false } , async (err , user , info) => {
            if(err || !user){
                //SI HAY UN ERROR O NO ESTA AUTENTICADO REDIRECCIONAMOS A /LOGIN
                return res.redirect('/login')
            }else{
                req.user = user //ASIGNAMOS LOS DATOS A 'user'
                const page = parseInt(req.query.page) || 1
                const limit = 9
                
                const skip = (page - 1) * limit
                const mongoProducts = await productService.getProducts({} , limit , skip , {}) //COPIA DE 'mongoProducts'
                const products = mongoProducts.map(product => ({ ...product._doc }))
        
                const totalProducts = await productService.getCountedProducts({})
                const totalPages = Math.ceil(totalProducts / limit)
        
                let isProducts = products.length== 0 ? true : false
                products.forEach((product) => {
        
                    product.price = ponerComas(product.price) //AGREGAMOS LAS COMAS
                    product.stock = ponerComas(product.stock) //AGREGAMOS LAS COMAS
        
                    product.price = product.price.toString().trim().toUpperCase()
                    product.stock = product.stock.toString().trim().toUpperCase()
                    product.category = product.category.trim().toUpperCase()
                    product.title = product.title.trim().toUpperCase()
                    product.code = product.code.trim().toUpperCase()
                })
        
                const prevLink = page > 1 ? `/?page=${page - 1}` : null;
                const nextLink = page < totalPages ? `/?page=${page + 1}` : null;
        
                res.render('home.handlebars' , {
                    hasNextPage: page < totalPages,
                    user: req.user.first_name,
                    totalPages: totalPages,
                    isProducts: isProducts,
                    hasPrevPage: page > 1,
                    products: products,
                    prevLink: prevLink,
                    nextLink: nextLink,
                    currentPage: page,
                    style: 'home.css',
                    showHeader: true,
                    title: 'Home'
                })
            }
        })(req , res , next)
    }catch(error){
        console.error(error)
    }
})

//REAL TIME PRODUCTS
router.get('/realTimeProducts' , (req , res , next) => {
    try{
        passport.authenticate("current" , { session: false } , async (err , user , info) => {
            if(err || !user){
                //SI HAY UN ERROR O NO ESTA AUTENTICADO REDIRECCIONAMOS A /LOGIN
                return res.redirect('/login')
            }else{
                req.user = user //ASIGNAMOS LOS DATOS A 'user'
                res.render('realTimeProducts.handlebars' , {
                    style: 'realTimeProducts.css',
                    user: req.user.first_name,
                    title: 'Real Time',
                    showHeader: true
                })
            }
        })(req , res , next)
    }catch(error){
        console.error(error)
    }
})

//CARTS | CART ID
router.get('/carts/:cid' , (req , res , next) => {
    try{
        passport.authenticate("current" , { session: false } , async (err , user , info) => {
            if(err || !user){
                return res.redirect('/')
            }else{
                req.user = user //ASIGNAMOS LOS DATOS A 'user'

                let message
                const { cid } = req.params
                const mongoCart = await cartService.getCart(cid)
                
                if(mongoCart == -1 || mongoCart == null){
                    message = "CARRITO NO ENCONTRADO"

                    res.render('cart.handlebars' , {
                        user: req.user.first_name,
                        style: 'cart.css',
                        showHeader: true,
                        message: message,
                        title: 'Cart',
                        id: cid
                    })
                }else{
                    const cart = mongoCart.products.map(cart => ({ ...cart._doc })) //COPIA DE 'mongoCart'
                    message = "CARRITO"
                
                    let isProducts = cart.length== 0 ? true : false
                    cart.forEach((productInCart) => {
                
                        productInCart.product.price = ponerComas(productInCart.product.price.toString().trim().toUpperCase())
                        productInCart.product.stock = ponerComas(productInCart.product.stock.toString().trim().toUpperCase())
                        productInCart.quantity = ponerComas(productInCart.quantity.toString().trim().toUpperCase())
                        productInCart.product.category = productInCart.product.category.trim().toUpperCase()
                        productInCart.product.title = productInCart.product.title.trim().toUpperCase()
                        productInCart.product.code = productInCart.product.code.trim().toUpperCase()
                        productInCart.product._id = productInCart.product._id.toString()
                    })
                
                    const cartCopy = cart.map(prod => ({
                        _id: prod.product._id.toString(),
                        category: prod.product.category,
                        title: prod.product.title,
                        price: prod.product.price,
                        stock: prod.product.stock,
                        code: prod.product.code,
                        quantity: prod.quantity,
                    }))
                
                    res.render('cart.handlebars' , {
                        user: req.user.first_name,
                        isProducts: isProducts,
                        cartProducts: cartCopy,
                        style: 'cart.css',
                        showHeader: true,
                        message: message,
                        title: 'Cart',
                        id: cid
                    })
                }
            }
        })(req , res , next)
    }catch(error){
        console.error(error)
    }
})

//LOGIN
router.get('/login' , async (req , res) => {
    res.render('login.handlebars' , {
        style: 'login.css',
        showHeader: false,
        title: 'Login'
    })
})

router.post('/login' , async (req , res) => {
    try{
        const { email , password } = req.body
        const user = await userService.login(email , password)
    
        if(user == -1){
            res.status(400).json({ error: 400 })
        }else{ 
            //TOKEN
            const token = jwt.sign({ first_name: user.first_name , last_name: user.last_name , email: user.email , cart: user.cart , role: user.role , age: user.age } , "coderhouse" , { expiresIn: "1h" })

            //COOKIE
            res.cookie("userToken" , token , {
                maxAge: 3600000,
                httpOnly: true
            })

            res.status(200).json({ message: 'LOGIN EXITOSO '})
        }
    }catch(error){
        console.error(error)
    }
})

//LOGOUT
router.get("/logout" , (req , res) => {
    res.clearCookie("userToken")
    res.redirect("/login")
})

//REGISTER
router.get('/register' , async (req , res) => {
    res.render('register.handlebars' , {
        style: 'register.css',
        showHeader: false,
        title: 'Register'
    })
})

router.post('/register' , async (req , res) => {
    try{
        const { first_name , last_name , password , email , age } = req.body
        const user = await userService.register(first_name , last_name , password , email , age)
    
        if(user == -1){
            res.status(400).json({ error: 400 })
        }else{
            //TOKEN
            const token = jwt.sign({ first_name: user.first_name , last_name: user.last_name , email: user.email , cart: user.cart , role: user.role , age: user.age } , "coderhouse" , { expiresIn: "1h" })

            //COOKIE
            res.cookie("userToken" , token , {
                maxAge: 3600000,
                httpOnly: true
            })

            res.status(200).json({ message: 'REGISTRO EXITOSO '})
        }
    }catch(error){
        console.error(error)
    }
})

//FUNCIONES
function ponerComas(value){
    let float = parseFloat(value)
    let parseado = float.toLocaleString('en-US', { maximumFractionDigits: 0 })

    return parseado
}

export default router