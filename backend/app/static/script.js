document.addEventListener("DOMContentLoaded", function () {
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

    // Обновляем иконку корзины при загрузке страницы
    updateCartIcon();

    // Функционал поиска - прямое управление видимостью
    const searchMenu = document.getElementById("searchMenu");
    const searchBlock = document.getElementById("searchBlock");

    if (searchMenu && searchBlock) {
        // Изначально скрываем поисковую строку
        searchBlock.style.display = "none";

        searchMenu.addEventListener("click", function(e) {
            e.preventDefault();

            // Переключаем видимость напрямую через style.display
            if (searchBlock.style.display === "none") {
                searchBlock.style.display = "block";
            } else {
                searchBlock.style.display = "none";
                // Очищаем поле ввода при закрытии
                const searchInput = searchBlock.querySelector(".search-input");
                if (searchInput) {
                    searchInput.value = "";
                }
            }
        });

        // Закрываем поиск при клике вне поисковой строки
        document.addEventListener("click", function(e) {
            if (!searchMenu.contains(e.target) && !searchBlock.contains(e.target) &&
                searchBlock.style.display === "block") {
                searchBlock.style.display = "none";
            }
        });
    }

    // Общая функция для добавления обработчиков на кнопки "В корзину"
    function initAddToCartButtons(selector) {
        const buttons = document.querySelectorAll(selector);

        buttons.forEach((button) => {
            button.addEventListener("click", function (e) {
                e.preventDefault();

                // Получаем родительский элемент (карточку товара)
                const productCard =
                    this.closest(".product") ||
                    this.closest(".new-arrival-item");

                if (productCard) {
                    // Извлекаем данные о товаре
                    const title = productCard.querySelector("h3").textContent;
                    const priceText = productCard.querySelector(
                        ".product-price, .new-arrival-price"
                    ).textContent;
                    const price = parseInt(priceText.replace(/\D/g, ""));
                    const image = productCard.querySelector("img").src;

                    // Формируем уникальный ID товара
                    const category = productCard.dataset.category || "new";
                    const id = category + "-" + title;

                    // Добавляем товар в корзину
                    addToCart(id, title, price, image);

                    // Показываем уведомление
                    showNotification("Товар добавлен в корзину!");
                }
            });
        });
    }

    // Функция для отображения уведомления
    function showNotification(message) {
        // Проверяем, существует ли уже уведомление
        let notification = document.querySelector(".cart-notification");

        // Если нет, создаем новое
        if (!notification) {
            notification = document.createElement("div");
            notification.className = "cart-notification";
            document.body.appendChild(notification);
        }

        notification.textContent = message;

        // Показываем уведомление
        setTimeout(() => {
            notification.classList.add("show");
        }, 100);

        // Скрываем через 2 секунды
        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    // Инициализация кнопок для всех секций
    initAddToCartButtons(".product .btn-outline");
    initAddToCartButtons(".new-arrival-item .btn-outline");

    // Функция для установки активного слайда отзывов
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

    // Функция для переключения слайдов hero
    function showHeroSlide(index) {
        // Сначала скрываем все слайды и убираем активный класс у точек
        heroSlides.forEach((slide) => slide.classList.remove("active"));
        heroDots.forEach((dot) => dot.classList.remove("active"));

        // Обрабатываем индекс слайда
        if (index < 0) index = heroSlides.length - 1;
        if (index >= heroSlides.length) index = 0;

        // Показываем нужный слайд и делаем активной соответствующую точку
        heroCurrentSlide = index;
        heroSlides[heroCurrentSlide].classList.add("active");
        heroDots[heroCurrentSlide].classList.add("active");
    }

    // Автоматическое переключение слайдов hero
    function startHeroCarousel() {
        heroSlideInterval = setInterval(() => {
            showHeroSlide(heroCurrentSlide + 1);
        }, 6000); // 6 секунд на один слайд
    }

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

    // Функционал для hero карусели
    const heroSlides = document.querySelectorAll(".hero-slide");
    const heroDots = document.querySelectorAll(".hero-dot");
    const heroPrevBtn = document.querySelector(".hero-prev");
    const heroNextBtn = document.querySelector(".hero-next");
    let heroCurrentSlide = 0;
    let heroSlideInterval;

    // Инициализируем карусель если элементы найдены
    if (heroSlides.length > 0) {
        // Останавливаем автопереключение при ховере на карусель
        const heroCarousel = document.querySelector(".hero-carousel");
        heroCarousel.addEventListener("mouseenter", () => {
            clearInterval(heroSlideInterval);
        });

        heroCarousel.addEventListener("mouseleave", () => {
            startHeroCarousel();
        });

        // Клики по кнопкам вперед/назад
        heroPrevBtn.addEventListener("click", () => {
            showHeroSlide(heroCurrentSlide - 1);
        });

        heroNextBtn.addEventListener("click", () => {
            showHeroSlide(heroCurrentSlide + 1);
        });

        // Клики по индикаторам (точкам)
        heroDots.forEach((dot) => {
            dot.addEventListener("click", function () {
                const slideIndex = parseInt(this.getAttribute("data-slide"));
                showHeroSlide(slideIndex);
            });
        });

        // Запуск автоматической смены слайдов
        startHeroCarousel();
    }

    // Функционал адаптивного меню с подменю
    const menuItems = document.querySelectorAll('.nav .has-submenu');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Предотвращаем переход по ссылке при клике на пункт с подменю
            if (window.innerWidth <= 992) { // Только для мобильного режима
                e.preventDefault();

                // Если кликнули на уже открытый пункт - закрываем его
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    const submenu = this.nextElementSibling || this.querySelector('.sub-menu');
                    if (submenu) {
                        submenu.style.maxHeight = '0';
                    }
                } else {
                    // Закрываем все ранее открытые подменю
                    document.querySelectorAll('.nav .has-submenu.active').forEach(activeItem => {
                        activeItem.classList.remove('active');
                        const openSubmenu = activeItem.nextElementSibling || activeItem.querySelector('.sub-menu');
                        if (openSubmenu) {
                            openSubmenu.style.maxHeight = '0';
                        }
                    });

                    // Открываем текущее подменю
                    this.classList.add('active');
                    const submenu = this.nextElementSibling || this.querySelector('.sub-menu');
                    if (submenu) {
                        submenu.style.maxHeight = submenu.scrollHeight + 'px';
                    }
                }
            }
        });
    });

    // Обработчик изменения размера окна
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            // Сбрасываем стили подменю при переходе на десктоп версию
            document.querySelectorAll('.sub-menu').forEach(submenu => {
                submenu.style.maxHeight = '';
            });
            document.querySelectorAll('.has-submenu.active').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
});

