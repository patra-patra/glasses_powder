document.addEventListener("DOMContentLoaded", function () {
    // Функционал табов для фильтрации товаров
    const tabs = document.querySelectorAll(".tab");
    const products = document.querySelectorAll(".product");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const category = tab.dataset.category;

            // Активный таб
            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");

            // Фильтрация товаров
            products.forEach((product) => {
                if (
                    category.includes("all") ||
                    product.dataset.category === category
                ) {
                    product.style.display = "block";
                } else {
                    product.style.display = "none";
                }
            });
        });
    });

    // Функционал корзины
    function getCart() {
        const cart = localStorage.getItem("beautyVisionCart");
        return cart ? JSON.parse(cart) : {};
    }

    function saveCart(cart) {
        localStorage.setItem("beautyVisionCart", JSON.stringify(cart));
    }

    function addToCart(id, title, price, image) {
        const cart = getCart();

        if (cart[id]) {
            cart[id].quantity += 1;
        } else {
            cart[id] = {
                id: id,
                title: title,
                price: price,
                image: image,
                quantity: 1,
            };
        }

        saveCart(cart);
        updateCartIcon();
    }

    function updateCartIcon() {
        const cart = getCart();
        const itemCount = Object.values(cart).reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const cartText = document.querySelector(".cart-text");
        if (cartText) {
            if (itemCount > 0) {
                cartText.textContent = `Корзина (${itemCount})`;
            } else {
                cartText.textContent = "Корзина";
            }
        }
    }

    // Добавление товаров в корзину со страницы
    const addToCartButtons = document.querySelectorAll(".btn-outline");
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault();

            const product = this.closest(".product");
            const id =
                product.dataset.category +
                "-" +
                product.querySelector("h3").textContent;
            const title = product.querySelector("h3").textContent;
            const priceText =
                product.querySelector(".product-price").textContent;
            const price = parseInt(priceText.replace(/\D/g, ""));
            const image = product.querySelector("img").src;

            addToCart(id, title, price, image);

            // Анимация добавления в корзину
            const notification = document.createElement("div");
            notification.className = "cart-notification";
            notification.textContent = "Товар добавлен в корзину!";
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.classList.add("show");
            }, 100);

            setTimeout(() => {
                notification.classList.remove("show");
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 2000);
        });
    });

    // Обновляем иконку корзины при загрузке страницы
    updateCartIcon();

    // Добавляем код для слайдера отзывов
    const reviewSlider = document.querySelector(".reviews-slider");
    const reviewItems = document.querySelectorAll(".review-item");
    const prevButton = document.querySelector(".review-prev");
    const nextButton = document.querySelector(".review-next");
    const dots = document.querySelectorAll(".review-dot");

    let currentIndex = 0;
    const totalItems = reviewItems.length;

    // Функция для установки активного слайда - перенесена в корень тела функции
    function showSlide(index) {
        if (index < 0) {
            index = totalItems - 1;
        } else if (index >= totalItems) {
            index = 0;
        }

        currentIndex = index;

        // Перемещаем слайдер
        reviewItems.forEach((item, i) => {
            if (i === currentIndex) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });

        // Обновляем точки
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);
        });
    }

    if (reviewSlider && reviewItems.length > 0) {
        // Инициализация слайдера
        showSlide(currentIndex);

        // Обработчики для кнопок навигации
        if (prevButton) {
            prevButton.addEventListener("click", () => {
                showSlide(currentIndex - 1);
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", () => {
                showSlide(currentIndex + 1);
            });
        }

        // Обработчики для точек
        dots.forEach((dot, i) => {
            dot.addEventListener("click", () => {
                showSlide(i);
            });
        });

        // Автоматическое переключение слайдов каждые 5 секунд
        setInterval(() => {
            showSlide(currentIndex + 1);
        }, 5000);
    }
});
