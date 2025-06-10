document.addEventListener("DOMContentLoaded", function () {
    // Получаем необходимые DOM элементы
    const cartItemsContainer = document.getElementById("cart-items");
    const cartEmptyMessage = document.querySelector(".cart-empty");
    const cartSummary = document.querySelector(".cart-summary");
    const totalPriceElement = document.getElementById("cart-total-price");
    const checkoutButton = document.getElementById("checkout");

    // Получение корзины из localStorage
    function getCart() {
        const cart = localStorage.getItem("beautyVisionCart");
        return cart ? JSON.parse(cart) : {};
    }

    // Сохранение корзины в localStorage
    function saveCart(cart) {
        localStorage.setItem("beautyVisionCart", JSON.stringify(cart));
    }

    // Форматирование цены
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
    }

    // Отображение корзины
    function renderCart() {
        const cart = getCart();
        const items = Object.values(cart);

        cartItemsContainer.innerHTML = "";

        if (items.length === 0) {
            cartEmptyMessage.classList.remove("hidden");
            cartSummary.classList.add("hidden");
            return;
        }

        cartEmptyMessage.classList.add("hidden");
        cartSummary.classList.remove("hidden");

        let totalPrice = 0;

        items.forEach((item) => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;

            const itemElement = document.createElement("div");
            itemElement.className = "cart-item";
            itemElement.innerHTML = `
                <img src="${item.image || "../img/placeholder.jpg"}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${formatPrice(item.price)} за шт.</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-total">${formatPrice(itemTotal)}</div>
                    <button class="remove-btn" data-id="${item.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;

            cartItemsContainer.appendChild(itemElement);
        });

        totalPriceElement.textContent = formatPrice(totalPrice);
        checkoutButton.disabled = items.length === 0;
    }

    // Удаление товара из корзины
    function removeItem(id) {
        const cart = getCart();
        delete cart[id];
        saveCart(cart);
        renderCart();
    }

    // Изменение количества товара
    function updateQuantity(id, change) {
        const cart = getCart();
        if (cart[id]) {
            cart[id].quantity += change;

            if (cart[id].quantity <= 0) {
                delete cart[id];
            }

            saveCart(cart);
            renderCart();
        }
    }

    // Обработка клика по кнопкам изменения количества и удаления
    cartItemsContainer.addEventListener("click", function (event) {
        const target = event.target;

        // Проверяем на нажатие кнопки уменьшения количества
        if (target.classList.contains("decrease")) {
            updateQuantity(target.dataset.id, -1);
        }
        // Проверяем на нажатие кнопки увеличения количества
        else if (target.classList.contains("increase")) {
            updateQuantity(target.dataset.id, 1);
        }
        // Проверяем на нажатие кнопки удаления
        else if (
            target.classList.contains("remove-btn") ||
            target.closest(".remove-btn")
        ) {
            const button = target.classList.contains("remove-btn")
                ? target
                : target.closest(".remove-btn");
            removeItem(button.dataset.id);
        }
    });

    // Оформление заказа
    checkoutButton.addEventListener("click", function () {
        alert(
            "Спасибо за заказ! В ближайшее время с вами свяжется наш менеджер."
        );
        localStorage.removeItem("beautyVisionCart");
        renderCart();
    });

    // Отображаем корзину при загрузке страницы
    renderCart();
});