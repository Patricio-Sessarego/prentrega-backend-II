const btnEntrar = document.getElementById('submit')

btnEntrar.addEventListener("click" , () => {
    let email = document.getElementById("inputEmail").value
    let password = document.getElementById("inputPassword").value

    let obj = { email , password }

    fetch("/login" , {
        method: "POST",
        body: JSON.stringify(obj),

        headers: {
            "Content-Type": "application/json",
        }
    })
    .then(res => {
        if (res.status === 400) {
            Swal.fire({
                text: 'CREDENCIALES INVALIDAS',
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

            document.getElementById("inputEmail").value = ''
            document.getElementById("inputPassword").value = ''
        }else if(res.status == 200){
            window.location.href = '/'
        }
    })
})