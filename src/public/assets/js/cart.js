const socket = io()

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { //ESPERAMOS A QUE CARGUE EL ELEMENTO CON ID 'carritoId' PARA PODER AGARRARLO
        let id = document.getElementById('carritoId').getAttribute('idCarrito')
        socket.emit('getCartId', id)
    }, 200)
})

socket.on('initialCart' , cart => { //CARGAMOS LOS PRODUCTOS DEL CARRITO

    let noProducts = document.getElementById('noProductsText') //SI NO HAY PRODUCTOS EN EL CARRITO
    let divProducts = document.getElementById('productos') //SI HAY 1 O MAS PRODUCTOS EN EL CARRITO

    if(cart.products.length == 0){ //SI NO HAY PRODUCTOS EN EL CARRITO...
        noProducts.innerText = 'CARRITO VACIO'

        if(divProducts.classList.contains('productos')){
            divProducts.classList.remove('productos')
            divProducts.classList.add('d-none')
        }
    }else{ //SI HAY 1 O MAS PRODUCTOS EN EL CARRITO
        divProducts.classList.add('productos')
        divProducts.classList.remove('d-none')
        noProducts.innerText = 'CARRITO'

        divProducts.innerHTML = ''
        cart.products.forEach((prod) => {
            const div = document.createElement("div")
            div.classList.add("producto")
    
            div.innerHTML = `
                <p title="CATEGORY" class="categoriaProducto"> ${prod.product.category.toUpperCase()} <i class="bi bi-tags-fill"></i> </p>
                <p title="TITLE" class="nombreProducto"> ${prod.product.title.toUpperCase()} <i class="bi bi-person-fill"></i> </p>
                <p title="CODE" class="codigoProducto"> ${prod.product.code.toUpperCase()} <i class="bi bi-upc-scan"></i> </p>
                <p title="PRICE" class="precioProducto"> ${ponerComas(prod.product.price)} <i class="bi bi-currency-dollar"></i> </p>
                <p title="STOCK" class="stockProducto"> ${ponerComas(prod.product.stock)} <i class="bi bi-box-seam-fill"></i> </p>
                <p title="QUANTITY" class="quantityProducto"> ${ponerComas(prod.quantity)} <i class="bi bi-cart-check-fill"></i> </p>
                <div class="btnContenedor">
                    <button class="btnBorrar" onclick="eventDeleteProductFromCart('${prod.product._id.toString()}')"> Borrar </button>
                </div>
            `
            divProducts.append(div)
        })
    }
})

socket.on('updatingCart' , (cart) => { //ACTUALIZAMOS LOS NUEVOS PRODUCTOS DEL CARRITO

    let noProducts = document.getElementById('noProductsText') //SI NO HAY PRODUCTOS EN EL CARRITO
    let divProducts = document.getElementById('productos') //SI HAY 1 O MAS PRODUCTOS EN EL CARRITO

    if(cart.products.length == 0){ //SI NO HAY PRODUCTOS EN EL CARRITO...
        noProducts.innerText = 'CARRITO VACIO'

        if(divProducts.classList.contains('productos')){
            divProducts.classList.remove('productos')
            divProducts.classList.add('d-none')
        }
    }else{ //SI HAY 1 O MAS PRODUCTOS REGISTRADOS EN EL CARRITO
        divProducts.classList.add('productos')
        divProducts.classList.remove('d-none')
        noProducts.innerText = 'CARRITO'

        divProducts.innerHTML = ''
        cart.products.forEach((prod) => {
            const div = document.createElement("div")
            div.classList.add("producto")
    
            div.innerHTML = `
                <p title="CATEGORY" class="categoriaProducto"> ${prod.product.category.toUpperCase()} <i class="bi bi-tags-fill"></i> </p>
                <p title="TITLE" class="nombreProducto"> ${prod.product.title.toUpperCase()} <i class="bi bi-person-fill"></i> </p>
                <p title="CODE" class="codigoProducto"> ${prod.product.code.toUpperCase()} <i class="bi bi-upc-scan"></i> </p>
                <p title="PRICE" class="precioProducto"> ${ponerComas(prod.product.price)} <i class="bi bi-currency-dollar"></i> </p>
                <p title="STOCK" class="stockProducto"> ${ponerComas(prod.product.stock)} <i class="bi bi-box-seam-fill"></i> </p>
                <p title="QUANTITY" class="quantityProducto"> ${ponerComas(prod.quantity)} <i class="bi bi-cart-check-fill"></i> </p>
                <div class="btnContenedor">
                    <button class="btnBorrar" onclick="eventDeleteProductFromCart('${prod.product._id.toString()}')"> Borrar </button>
                </div>
            `
            divProducts.append(div)
        })
    }
})


//FUNCIONES
function ponerComas(value){
    let float = parseFloat(value)
    let parseado = float.toLocaleString('en-US', { maximumFractionDigits: 0 });

    return parseado
}

function eventDeleteProductFromCart(productId){ //HACER LA FUNCION PARA BORRAR DEL CARRITO
    Swal.fire({
        text: 'PRODUCTO ELIMINADO DEL CARRITO',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'ACEPTAR',
        background: '#e3f2fd',
        iconColor: '#4caf50',
        title: '¡EXITO!',
        padding: '20px',
        icon: 'success',
        
        customClass: {
            title: 'swalTitleSuccess',
            content: 'swalContentSuccess',
            confirmButton: 'swalConfirmButtonSuccess'
        }
    })

    socket.emit('productDeletedFromCart' , productId)
}