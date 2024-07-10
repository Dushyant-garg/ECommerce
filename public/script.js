const name = document.getElementById("name")
const desc = document.getElementById("desc")
const brand = document.getElementById("brand")
const imageInput = document.getElementById("imageInput")
const price = document.getElementById("price")
const btn = document.getElementById("btn")

btn.addEventListener("click", () =>{
    
    const imageFile = imageInput.files[0]
    const formData = new FormData()
    formData.append("name", name.value)
    formData.append("description", desc.value)
    formData.append("brand", brand.value)
    formData.append("price", price.value)
    formData.append("image", imageFile)
    console.log(formData)

    fetch("/product/create-product",{
        method: "POST",
        body: formData
    })
    .then((res)=>{
        if (res.status === 200) {
            window.location.href = "/"
        }
        else {
            window.location.href = "/auth/signin"
        }
    })
    .catch((err)=>{
        console.log("error adding product" , err)
    })

})