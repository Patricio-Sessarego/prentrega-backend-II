import ProductDaosMongo from './daos/MONGO/productsDaos.mongo.js'
import initializePassport from './config/passport.config.js'
import CartDaosMongo from './daos/MONGO/cartsDaos.mongo.js'
import handlebars from 'express-handlebars'
import routerApp from './router/index.js'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import { Server } from 'socket.io'
import passport from 'passport'
import express from 'express'
import path from 'path'
import './database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const productService = new ProductDaosMongo
const cartService = new CartDaosMongo

const app = express()
const PORT = 8080

//MIDDLEWARE
initializePassport()
app.use(cookieParser())
app.use(express.json())
app.use(passport.initialize())
app.use(express.urlencoded({ extended: true }))
app.use('/static' , express.static(__dirname + '/public'))

//HANDLEBARS HELPERS
const hbs = handlebars.create({
    helpers: { //LOS USO EN 'home.handlebars'
        range: function(start, end, options) {
            let ret = [];
            for (let i = start; i <= end; i++) {
                ret.push(i);
            }
            return ret;
        },
        eq: function (a, b) {
            return a === b;
        }
    }
})

//HANDLEBARS CONFIG
app.engine('handlebars' , hbs.engine)
app.set('views' , __dirname + '/views')
app.set('view engine' , 'handlebars')

//RUTAS
app.use(routerApp)

//ERROR
app.use((error , req , res , next) => {
    console.error(error)
    res.status(500).send('ERROR DE SERVER')
})

//SERVER
const httpServer = app.listen(PORT , () => {
    console.log(`ESCUCHANDO EN EL PUERTO ${PORT}`)
})

const io = new Server(httpServer)

io.on('connection' , async (socket) => {

    //REAL TIME PRODUCTS
    socket.on('getProducts' , async (page) => {
        const limit = 9
        const skip = (page - 1) * limit

        const products = await productService.getProducts({} , limit , skip , {})
        const totalProducts = await productService.getCountedProducts({})
        const totalPages = Math.ceil(totalProducts / limit)

        socket.emit('initialProducts' , {
            products,
            totalPages,
            currentPage: page
        })
    })

    socket.on('newProduct' , async (product) => {
        let page = product.newPage

        const products = await productService.getProducts({} , 0 , 0 , {})
        let flag = false
        for(let i = 0; i < products.length; i++){
            let prod = products[i]
            if(prod.code.toUpperCase() == product.newProduct.code.toUpperCase()){
                flag = true
                break
            }
        }

        if(!flag){
            const limit = 9
            const skip = (page - 1) * limit
            product = await productService.createProduct(product.newProduct)

            const updatedProducts = await productService.getProducts({} , limit , skip , {})
            const totalProducts = await productService.getCountedProducts({})
            const totalPages = Math.ceil(totalProducts / limit)

            io.emit('productAdded' , {
                page,
                totalPages,
                updatedProducts
            })
        }else{
            socket.emit('dupCode' , { message: 'EL CODIGO DE LOS PRODUCTOS TIENE QUE SER UNICO' })
        }
    })

    socket.on('deletedProduct' , async ({ productId , currentPage }) => {
        let page = currentPage
        await productService.deleteProduct(productId)

        const limit = 9
        const skip = (page - 1) * limit

        const updatedProducts = await productService.getProducts({} , limit , skip , {})
        const totalProducts = await productService.getCountedProducts({})
        const totalPages = Math.ceil(totalProducts / limit)

        io.emit('productDeleted' , {
            page,
            totalPages,
            updatedProducts
        })
    })

    socket.on('productAddedToCart' , async (productId) => {
        await cartService.createProductCart('66d09bda09af90b064f205fb' , productId , 1)
    })

    //CART
    let cartId
    let cart
    socket.on('getCartId' , async (id) => {
        cartId = id
        cart = await cartService.getCart(cartId.toString())
        socket.emit('initialCart' , cart)
    })

    socket.on('productDeletedFromCart' , async (productId) => {
        await cartService.deleteProductCart(cartId , productId)
        cart = await cartService.getCart(cartId)
        io.emit('updatingCart' , cart)
    })
})