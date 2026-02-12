// Load Cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Update Cart Count
function updateCartCount() {
    let cartCount = document.getElementById("cart-count");
    if (cartCount) {
        cartCount.innerText = cart.length;
    }
}

// Add To Cart
function addToCart(name, price) {
    cart.push({ name, price });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(name + " added to cart!");
    updateCartCount();
}

// Search Products
function searchProducts(event) {
    event.preventDefault();

    let input = document.getElementById("search-input").value.toLowerCase();
    let products = document.querySelectorAll("article");

    products.forEach(product => {
        let title = product.querySelector("h3").innerText.toLowerCase();
        product.style.display = title.includes(input) ? "block" : "none";
    });
}

document.addEventListener("DOMContentLoaded", updateCartCount);
