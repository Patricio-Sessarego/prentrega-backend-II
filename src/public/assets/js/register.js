const btnEntrar = document.getElementById('submit')

btnEntrar.addEventListener("click" , () => {
    let age = document.getElementById("inputAge").value
    let email = document.getElementById("inputEmail").value
    let password = document.getElementById("inputPassword").value
    let last_name = document.getElementById("inputLastName").value
    let first_name = document.getElementById("inputFirstName").value

    let obj = { age , email , password , last_name , first_name }

    fetch("/register" , {
        method: "POST",
        body: JSON.stringify(obj),

        headers: {
            "Content-Type": "application/json",
        }
    })
    .then(res => {
        if (res.status === 400) {
            Swal.fire({
                text: 'YA EXISTE UN USUARIO CON ESE EMAIL',
                confirmButtonText: 'ACEPTAR',
                confirmButtonColor: '#d33',
                background: '#fff3f3',
                iconColor: '#f27474',
                title: '¡ATENCIÓN!',
                padding: '20px',
                icon: 'error',
                customClass: {
                    title: 'swalTitle',
                    content: 'swalContent',
                    confirmButton: 'swalConfirmButton'
                }
            })

            document.getElementById("inputAge").value = ''
            document.getElementById("inputEmail").value = ''
            document.getElementById("inputPassword").value = ''
            document.getElementById("inputLastName").value = ''
            document.getElementById("inputFirstName").value = ''
        }else if(res.status == 200){
            window.location.href = '/'
        }
    })
})