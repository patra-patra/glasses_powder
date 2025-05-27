document.addEventListener("DOMContentLoaded", function () {
    const cart = {};
    const cartContainer = document.getElementById("cart");
    const cartTotal = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout");

    function renderCart() {
        cartContainer.innerHTML = "";
        let total = 0;
        let hasItems = false;
        for (const id in cart) {
            hasItems = true;
            const item = cart[id];
            const itemDiv = document.createElement("div");
            itemDiv.className = "cart-item";
            itemDiv.innerHTML = `
                <span class="cart-item-title">${item.title}</span>
                <span class="cart-item-qty">×${item.qty}</span>
                <span>${item.price * item.qty} ₽</span>
                <button class="cart-item-remove" data-id="${id}" title="Удалить">×</button>
            `;
            cartContainer.appendChild(itemDiv);
            total += item.price * item.qty;
        }
        cartTotal.textContent = total + " ₽";
        checkoutBtn.disabled = !hasItems;
        if (!hasItems) {
            cartContainer.innerHTML = "<em>Корзина пуста</em>";
        }
    }

    document.querySelectorAll(".add-to-cart").forEach((btn) => {
        btn.addEventListener("click", function () {
            const product = btn.closest(".product");
            const id = product.dataset.id;
            const title = product.dataset.title;
            const price = parseInt(product.dataset.price, 10);
            if (!cart[id]) {
                cart[id] = { title, price, qty: 1 };
            } else {
                cart[id].qty += 1;
            }
            renderCart();
        });
    });

    cartContainer.addEventListener("click", function (e) {
        if (e.target.classList.contains("cart-item-remove")) {
            const id = e.target.dataset.id;
            delete cart[id];
            renderCart();
        }
    });

    checkoutBtn.addEventListener("click", function () {
        alert("Спасибо за заказ!");
        for (const id in cart) delete cart[id];
        renderCart();
    });

    renderCart();
});
