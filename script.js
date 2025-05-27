document.addEventListener("DOMContentLoaded", function () {
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
                    category === "all" ||
                    product.dataset.category === category
                ) {
                    product.style.display = "block";
                } else {
                    product.style.display = "none";
                }
            });
        });
    });
});
