document.addEventListener("DOMContentLoaded", function () {
    // Переключение вкладок в личном кабинете
    const tabLinks = document.querySelectorAll(".account-nav a[data-tab]");
    const tabContents = document.querySelectorAll(".tab-content");

    tabLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            // Убираем активный класс у всех пунктов меню и содержимого вкладок
            tabLinks.forEach((item) =>
                item.parentElement.classList.remove("active")
            );
            tabContents.forEach((item) => item.classList.remove("active"));

            // Добавляем активный класс выбранному пункту меню и соответствующей вкладке
            this.parentElement.classList.add("active");
            const tabId = this.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");

            // Прокручиваем страницу вверх
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    // Функционал редактирования личных данных
    const editBtns = document.querySelectorAll(".edit-btn");
    const cancelBtns = document.querySelectorAll(".cancel-btn");

    editBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const formId = this.getAttribute("data-form");
            const form = document.getElementById(formId);
            const dataBlock = form.previousElementSibling;

            dataBlock.style.display = "none";
            form.classList.remove("hidden");
        });
    });

    cancelBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const formId = this.getAttribute("data-form");
            const form = document.getElementById(formId);
            const dataBlock = form.previousElementSibling;

            form.classList.add("hidden");
            dataBlock.style.display = "block";
        });
    });

    // Функционал добавления адреса
    const addAddressBtn = document.getElementById("add-address-btn");
    const addressForm = document.getElementById("address-form");
    const cancelAddressBtn = document.getElementById("cancel-address-btn");

    if (addAddressBtn && addressForm) {
        addAddressBtn.addEventListener("click", function () {
            addressForm.classList.remove("hidden");
            // Прокручиваем к форме
            addressForm.scrollIntoView({ behavior: "smooth" });
        });
    }

    if (cancelAddressBtn && addressForm) {
        cancelAddressBtn.addEventListener("click", function () {
            addressForm.classList.add("hidden");
        });
    }

    // Обработка отправки форм
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            // Здесь должна быть логика отправки формы на сервер

            // Имитация успешной отправки
            showNotification("Данные успешно сохранены!");

            // Если это форма редактирования персональных данных, скрываем её
            if (form.id === "personal-form") {
                const dataBlock = form.previousElementSibling;
                form.classList.add("hidden");
                dataBlock.style.display = "block";

                // Обновляем отображаемые данные
                const firstName = document.getElementById("firstname").value;
                const lastName = document.getElementById("lastname").value;
                const email = document.getElementById("email").value;
                const phone = document.getElementById("phone").value;

                dataBlock.querySelector(
                    ".data-value:nth-child(2)"
                ).textContent = firstName;
                dataBlock.querySelector(
                    ".data-row:nth-child(2) .data-value"
                ).textContent = lastName;
                dataBlock.querySelector(
                    ".data-row:nth-child(3) .data-value"
                ).textContent = email;
                dataBlock.querySelector(
                    ".data-row:nth-child(4) .data-value"
                ).textContent = phone;
            }

            // Если это форма добавления адреса, скрываем её
            if (form.id === "address-form") {
                form.classList.add("hidden");
                form.reset();
            }
        });
    });

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

    // Функционал поиска
    const searchMenu = document.getElementById("searchMenu");
    const searchBlock = document.getElementById("searchBlock");

    if (searchMenu && searchBlock) {
        searchMenu.addEventListener("click", function (e) {
            e.preventDefault();

            if (
                searchBlock.style.display === "none" ||
                searchBlock.style.display === ""
            ) {
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
        document.addEventListener("click", function (e) {
            if (
                !searchMenu.contains(e.target) &&
                !searchBlock.contains(e.target) &&
                searchBlock.style.display === "block"
            ) {
                searchBlock.style.display = "none";
            }
        });
    }
});
