let cart = JSON.parse(localStorage.getItem("cart")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];

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
    alert("Added to cart!");
    updateCartCount();
}

// Load Seller Products
function loadProducts() {
    let container = document.getElementById("dynamic-products");
    if (!container) return;

    container.innerHTML = "";

    products.forEach(product => {
        let div = document.createElement("article");
        div.innerHTML = `
            <h3>${product.name}</h3>
            <p>₹${product.price}</p>
            <button onclick="addToCart('${product.name}', ${product.price})">
                Add to Cart
            </button>
        `;
        container.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
    loadProducts();
});
