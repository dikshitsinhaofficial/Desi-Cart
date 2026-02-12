let products = JSON.parse(localStorage.getItem("products")) || [];

function addProduct(event) {
    event.preventDefault();

    let name = document.getElementById("product-name").value;
    let price = document.getElementById("product-price").value;
    let category = document.getElementById("product-category").value;

    let newProduct = {
        name,
        price,
        category
    };

    products.push(newProduct);
    localStorage.setItem("products", JSON.stringify(products));

    alert("Product Added Successfully!");
    document.getElementById("add-product-form").reset();
}
