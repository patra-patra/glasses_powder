<script>
document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartEmptyMessage = document.querySelector(".cart-empty");
    const cartSummary = document.querySelector(".cart-summary");
    const totalPriceElement = document.getElementById("cart-total-price");
    const checkoutButton = document.getElementById("checkout");

    function getCart() {
        const cart = localStorage.getItem("beautyVisionCart");
        return cart ? JSON.parse(cart) : {};
    }

    function saveCart(cart) {
        localStorage.setItem("beautyVisionCart", JSON.stringify(cart));
    }

    function formatPrice(price) {
        if (typeof price !== "number" || isNaN(price)) {
            return "0 ₽";
        }
        return price.toLocaleString("ru-RU") + " ₽";
    }

    function renderCart() {
        const cart = getCart();
        const items = Object.values(cart);
        cartItemsContainer.innerHTML = "";

        if (items.length === 0) {
            cartEmptyMessage?.classList.remove("hidden");
            cartSummary?.classList.add("hidden");
            return;
        }

        cartEmptyMessage?.classList.add("hidden");
        cartSummary?.classList.remove("hidden");

        let totalPrice = 0;

        items.forEach((item) => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.title}</td>
                <td>${formatPrice(item.price)}</td>
                <td>
                    <button class="quantity-btn decrease" data-id="${item.id}">−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </td>
                <td>${formatPrice(itemTotal)}</td>
            `;
            cartItemsContainer.appendChild(row);
        });

        totalPriceElement.textContent = formatPrice(totalPrice);
    }

    cartItemsContainer.addEventListener("click", function (event) {
        const button = event.target;
        const id = button.dataset.id;
        if (!id) return;

        const cart = getCart();
        const item = cart[id];
        if (!item) return;

        if (button.classList.contains("increase")) {
            item.quantity++;
        } else if (button.classList.contains("decrease")) {
            item.quantity--;
            if (item.quantity <= 0) {
                delete cart[id];
            }
        }

        saveCart(cart);
        renderCart();
    });

    checkoutButton?.addEventListener("click", function () {
        const cart = getCart();
        if (Object.keys(cart).length === 0) {
            alert("Корзина пуста!");
            return;
        }

        // TODO: отправка на сервер через fetch или редирект на оформление
        alert("Оформление заказа (заглушка)");
    });

    renderCart();
});
</script>
