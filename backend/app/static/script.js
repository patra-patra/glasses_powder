document.addEventListener("DOMContentLoaded", function () {
    //Функционал корзины
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

    updateCartIcon();

    function initAddToCartButtons(selector) {
        const buttons = document.querySelectorAll(selector);

        buttons.forEach((button) => {
            button.addEventListener("click", function (e) {
                e.preventDefault();
                const productCard =
                    this.closest(".product") ||
                    this.closest(".new-arrival-item");

                if (productCard) {
                    const title = productCard.querySelector("h3").textContent;
                    const priceText = productCard.querySelector(
                        ".product-price, .new-arrival-price"
                    ).textContent;
                    const price = parseInt(priceText.replace(/\D/g, ""));
                    const image = productCard.querySelector("img").src;
                    const category = productCard.dataset.category || "new";
                    const id = category + "-" + title;

                    addToCart(id, title, price, image);
                    showNotification("Товар добавлен в корзину!");
                }
            });
        });
    }

    function showNotification(message) {
        let notification = document.querySelector(".cart-notification");
        if (!notification) {
            notification = document.createElement("div");
            notification.className = "cart-notification";
            document.body.appendChild(notification);
        }

        notification.textContent = message;

        setTimeout(() => {
            notification.classList.add("show");
        }, 100);

        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    initAddToCartButtons(".product .btn-outline");
    initAddToCartButtons(".new-arrival-item .btn-outline");

    const tabs = document.querySelectorAll(".tab");
    const products = document.querySelectorAll(".product");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const category = tab.dataset.category;

            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");

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

    updateCartIcon();

    const reviewSlider = document.querySelector(".reviews-slider");
    const reviewItems = document.querySelectorAll(".review-item");
    const prevButton = document.querySelector(".review-prev");
    const nextButton = document.querySelector(".review-next");
    const dots = document.querySelectorAll(".review-dot");

    let currentIndex = 0;
    const totalItems = reviewItems.length;

    if (reviewSlider && reviewItems.length > 0) {
        showSlide(currentIndex);

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

        dots.forEach((dot, i) => {
            dot.addEventListener("click", () => {
                showSlide(i);
            });
        });

        setInterval(() => {
            showSlide(currentIndex + 1);
        }, 5000);
    }

    function showSlide(index) {
        if (index < 0) {
            index = totalItems - 1;
        } else if (index >= totalItems) {
            index = 0;
        }

        currentIndex = index;

        reviewItems.forEach((item, i) => {
            item.style.display = i === currentIndex ? "block" : "none";
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);
        });
    }

    const heroSlides = document.querySelectorAll(".hero-slide");
    const heroDots = document.querySelectorAll(".hero-dot");
    const heroPrevBtn = document.querySelector(".hero-prev");
    const heroNextBtn = document.querySelector(".hero-next");
    let heroCurrentSlide = 0;
    let heroSlideInterval;

    if (heroSlides.length > 0) {
        const heroCarousel = document.querySelector(".hero-carousel");
        heroCarousel.addEventListener("mouseenter", () => {
            clearInterval(heroSlideInterval);
        });

        heroCarousel.addEventListener("mouseleave", () => {
            startHeroCarousel();
        });

        heroPrevBtn.addEventListener("click", () => {
            showHeroSlide(heroCurrentSlide - 1);
        });

        heroNextBtn.addEventListener("click", () => {
            showHeroSlide(heroCurrentSlide + 1);
        });

        heroDots.forEach((dot) => {
            dot.addEventListener("click", function () {
                const slideIndex = parseInt(this.getAttribute("data-slide"));
                showHeroSlide(slideIndex);
            });
        });

        startHeroCarousel();
    }

    function showHeroSlide(index) {
        heroSlides.forEach((slide) => slide.classList.remove("active"));
        heroDots.forEach((dot) => dot.classList.remove("active"));

        if (index < 0) index = heroSlides.length - 1;
        if (index >= heroSlides.length) index = 0;

        heroCurrentSlide = index;
        heroSlides[heroCurrentSlide].classList.add("active");
        heroDots[heroCurrentSlide].classList.add("active");
    }

    function startHeroCarousel() {
        heroSlideInterval = setInterval(() => {
            showHeroSlide(heroCurrentSlide + 1);
        }, 6000);
    }

    const menuItems = document.querySelectorAll(".nav .has-submenu");

    menuItems.forEach((item) => {
        item.addEventListener("click", function (e) {
            if (window.innerWidth <= 992) {
                e.preventDefault();

                if (this.classList.contains("active")) {
                    this.classList.remove("active");
                    const submenu =
                        this.nextElementSibling ||
                        this.querySelector(".sub-menu");
                    if (submenu) {
                        submenu.style.maxHeight = "0";
                    }
                } else {
                    document
                        .querySelectorAll(".nav .has-submenu.active")
                        .forEach((activeItem) => {
                            activeItem.classList.remove("active");
                            const openSubmenu =
                                activeItem.nextElementSibling ||
                                activeItem.querySelector(".sub-menu");
                            if (openSubmenu) {
                                openSubmenu.style.maxHeight = "0";
                            }
                        });

                    this.classList.add("active");
                    const submenu =
                        this.nextElementSibling ||
                        this.querySelector(".sub-menu");
                    if (submenu) {
                        submenu.style.maxHeight =
                            submenu.scrollHeight + "px";
                    }
                }
            }
        });
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 992) {
            document.querySelectorAll(".sub-menu").forEach((submenu) => {
                submenu.style.maxHeight = "";
            });
            document
                .querySelectorAll(".has-submenu.active")
                .forEach((item) => {
                    item.classList.remove("active");
                });
        }
    });
});
