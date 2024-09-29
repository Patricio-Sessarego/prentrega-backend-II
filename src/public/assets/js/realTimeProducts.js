const socket = io()
let submitButton = document.getElementById('submit') //BOTON REGISTRAR
let paginationDiv = document.querySelector('.pagination') //PAGINACION DE LOS PRODUCTOS

document.addEventListener('DOMContentLoaded' , () => {
    const urlParams = new URLSearchParams(window.location.search) //AGARRAMOS LA URL
    const page = parseInt(urlParams.get('page')) || 1 //DEFINIMOS PAGE

    let noProducts = document.getElementById('noProducts') //SI NO HAY PRODUCTOS
    let divProducts = document.getElementById('productos') //SI HAY 1 O MAS PRODUCTOS

    socket.on('initialProducts' , ({ products , totalPages , currentPage }) => {
        if(products.length == 0){
            if(noProducts.classList.contains('d-none')){
                noProducts.classList.remove('d-none')
            }
    
            if(divProducts.classList.contains('productos')){
                divProducts.classList.remove('productos')
            }
        }else{
            divProducts.classList.add('productos')
            noProducts.classList.add('d-none')

            divProducts.innerHTML = ''
            products.forEach((product) => {
                const div = document.createElement("div")
                div.classList.add("producto")
        
                div.innerHTML = `
                    <p title="CATEGORY" class="categoriaProducto"> ${product.category.toUpperCase()} <i class="bi bi-tags-fill"></i> </p>
                    <p title="TITLE" class="nombreProducto"> ${product.title.toUpperCase()} <i class="bi bi-person-fill"></i> </p>
                    <p title="CODE" class="codigoProducto"> ${product.code.toUpperCase()} <i class="bi bi-upc-scan"></i> </p>
                    <p title="PRICE" class="precioProducto"> ${ponerComas(product.price)} <i class="bi bi-currency-dollar"></i> </p>
                    <p title="STOCK" class="stockProducto"> ${ponerComas(product.stock)} <i class="bi bi-box-seam-fill"></i> </p>
                    <div class="btnContenedor">
                        <button class="btnAgregarAlCarrito" onclick="eventAddToCart('${product._id.toString()}')"> <i class="bi bi-cart-plus-fill"></i> </button>
                        <button class="btnBorrar" onclick="eventDeleteProduct('${product._id.toString()}')"> Borrar </button>
                    </div>
                `
                divProducts.append(div)
            })

            updatePagination(currentPage , totalPages) //PAGINACION
        }
    })

    loadProducts(page) //CARGAMOS PRODUCTOS
})

submitButton.addEventListener('click' , (event) => { //REGISTRAMOS UN NUEVO PRODUCTO
    event.preventDefault()

    let category = document.getElementById('inputCategoria')
    let price = document.getElementById('inputPrecio')
    let stock = document.getElementById('inputStock')
    let title = document.getElementById('inputTitle')
    let code = document.getElementById('inputCodigo')

    if(category.value.trim().length == 0 || price.value.trim().length == 0 || stock.value.trim().length == 0 || title.value.trim().length == 0 || code.value.trim().length == 0){
        Swal.fire({ //SI FALTA LLENAR ALGUN CAMPO MOSTRAMOS UNA ALERTA
            text: 'POR FAVOR, LLENE TODOS LOS CAMPOS',
            confirmButtonText: 'ACEPTAR',
            confirmButtonColor: '#d33',
            background: '#fff3f3',
            iconColor: '#f27474',
            title: '¡ATENCION!',
            padding: '20px',
            icon: 'error',

            customClass: {
                title: 'swalTitle',
                content: 'swalContent',
                confirmButton: 'swalConfirmButton'
            }
        });
    }else{ //SI ESTAN TODOS LOS CAMPOS LLENOS
        const newProduct = {
            category: category.value.trim(),
            price: price.value.trim(),
            stock: stock.value.trim(),
            title: title.value.trim(),
            code: code.value.trim()
        }

        category.value = ''
        price.value = ''
        stock.value = ''
        title.value = ''
        code.value = ''

        socket.emit('newProduct' , {
            newProduct,
            newPage: 1
        })

        Swal.fire({ //ALERTA DE QUE SE AGREGO CORRECTAMENTE
            text: 'PRODUCTO AGREGADO CORRECTAMENTE',
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
        });
    }
})

socket.on('productAdded' , ({ page , totalPages , updatedProducts }) => { //ACTUALIZAMOS EN TIEMPO REAL CON EL NUEVO PRODUCTO
    let noProducts = document.getElementById('noProducts')
    let divProducts = document.getElementById('productos')

    if (!noProducts.classList.contains('d-none')) {
        noProducts.classList.add('d-none')
    }

    if (!divProducts.classList.contains('productos')) {
        divProducts.classList.add('productos')
    }

    divProducts.innerHTML = ''
    updatedProducts.forEach((product) => {
        const div = document.createElement("div")
        div.classList.add("producto")
        div.innerHTML = `
            <p class="categoriaProducto"> ${product.category.toUpperCase()} <i class="bi bi-tags-fill"></i> </p>
            <p class="nombreProducto"> ${product.title.toUpperCase()} <i class="bi bi-person-fill"></i> </p>
            <p class="codigoProducto"> ${product.code.toUpperCase()} <i class="bi bi-upc-scan"></i> </p>
            <p class="precioProducto"> ${ponerComas(product.price)} <i class="bi bi-currency-dollar"></i> </p>
            <p class="stockProducto"> ${ponerComas(product.stock)} <i class="bi bi-box-seam-fill"></i> </p>
            <div class="btnContenedor">
                <button class="btnAgregarAlCarrito" onclick="eventAddToCart('${product._id.toString()}')"> <i class="bi bi-cart-plus-fill"></i> </button>
                <button class="btnBorrar" onclick="eventDeleteProduct('${product._id.toString()}')"> Borrar </button>
            </div>
        `
        divProducts.append(div)
    })

    updatePagination(page, totalPages) //PAGINACION
    loadProducts(page) //CARGAMOS PRODUCTOS
})

socket.on('dupCode' , (data) => { //MOSTRAMOS UNA ALERTA DE QUE EL CODIGO TIENE QUE SER UNICO
    Swal.fire({
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#d33',
        background: '#fff3f3',
        iconColor: '#f27474',
        title: '¡ATENCION!',
        text: data.message,
        padding: '20px',
        icon: 'error',

        customClass: {
            title: 'swalTitle',
            content: 'swalContent',
            confirmButton: 'swalConfirmButton'
        }
    })
})

socket.on('productDeleted' , ({ page , totalPages , updatedProducts }) => {
    let noProducts = document.getElementById('noProducts')
    let divProducts = document.getElementById('productos')

    if (!noProducts.classList.contains('d-none')) {
        noProducts.classList.add('d-none')
    }

    if (!divProducts.classList.contains('productos')) {
        divProducts.classList.add('productos')
    }

    divProducts.innerHTML = ''
    updatedProducts.forEach((product) => {
        const div = document.createElement("div")
        div.classList.add("producto")
        div.innerHTML = `
            <p class="categoriaProducto"> ${product.category.toUpperCase()} <i class="bi bi-tags-fill"></i> </p>
            <p class="nombreProducto"> ${product.title.toUpperCase()} <i class="bi bi-person-fill"></i> </p>
            <p class="codigoProducto"> ${product.code.toUpperCase()} <i class="bi bi-upc-scan"></i> </p>
            <p class="precioProducto"> ${ponerComas(product.price)} <i class="bi bi-currency-dollar"></i> </p>
            <p class="stockProducto"> ${ponerComas(product.stock)} <i class="bi bi-box-seam-fill"></i> </p>
            <div class="btnContenedor">
                <button class="btnAgregarAlCarrito" onclick="eventAddToCart('${product._id.toString()}')"> <i class="bi bi-cart-plus-fill"></i> </button>
                <button class="btnBorrar" onclick="eventDeleteProduct('${product._id.toString()}')"> Borrar </button>
            </div>
        `
        divProducts.append(div)
    })

    updatePagination(page, totalPages) //PAGINACION
    loadProducts(page) //CARGAMOS PRODUCTOS
})

//FUNCIONES
function ponerComas(value){
    let float = parseFloat(value)
    let parseado = float.toLocaleString('en-US', { maximumFractionDigits: 0 });

    return parseado
}

function eventDeleteProduct(productId){
    Swal.fire({
        text: 'DESEA ELIMINAR EL PRODUCTO?',
        confirmButtonText: 'ELIMINAR',
        cancelButtonText: "CANCELAR",
        cancelButtonColor: '#3085d6',
        confirmButtonColor: '#d33',
        showCancelButton: true,
        background: '#fff3f3',
        iconColor: '#f27474',
        title: '¡ATENCION!',
        padding: '20px',
        icon: 'error',

        customClass: {
            title: 'swalTitleError'
        }
    }).then((result) => {
        if(result.isConfirmed){
            Swal.fire({
                text: 'EL PRODUCTO SE ELIMINO CORRECTAMENTE',
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

            socket.emit('deletedProduct' , {
                productId,
                newPage: 1
            })
        }
    });
}

function eventAddToCart(productId){
    Swal.fire({
        text: 'PRODUCTO AGREGADO AL CARRITO',
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

    socket.emit('productAddedToCart' , productId)
}

function loadProducts(page = 1){
    history.pushState(null , '' , `?page=${page}`) //ACTUALIZAMOS LA URL
    socket.emit('getProducts' , page)
}

function updatePagination(currentPage, totalPages) {
    paginationDiv.innerHTML = ''

    if(currentPage > 1){
        paginationDiv.innerHTML += `<button class="paginationButton previousPage" onclick="loadProducts(${currentPage - 1})"><i class="bi bi-arrow-left"></i></button>`
    }

    for(let i = 1; i <= totalPages; i++){
        if(i === currentPage){
            paginationDiv.innerHTML += `<button class="paginationButton currentPaginationButton" disabled>${i}</button>`
        }else{
            paginationDiv.innerHTML += `<button class="paginationButton" onclick="loadProducts(${i})">${i}</button>`
        }
    }

    if (currentPage < totalPages) {
        paginationDiv.innerHTML += `<button class="paginationButton nextPage" onclick="loadProducts(${currentPage + 1})"><i class="bi bi-arrow-right"></i></button>`
    }
}

//EVENTOS PARA PREVENIR EL USO DEL ESPACIO
let inputCode = document.getElementById('inputCodigo')
inputCode.addEventListener('keypress' , (event) => {
    if(event.key === ' '){
        event.preventDefault()
    }
})

let inputPrice = document.getElementById('inputPrecio')
inputPrice.addEventListener('keypress' , (event) => {
    if(event.key === ' '){
        event.preventDefault()
    }
})

let inputStock = document.getElementById('inputStock')
inputStock.addEventListener('keypress' , (event) => {
    if(event.key === ' '){
        event.preventDefault()
    }
})